"""Read-only independent SAC reconstruction and cash-conservation checks.

Input JSON on stdin (or a file argument): {config, options, result}.
Outputs only counts and maximum differences, never private rows or parameters.
This checks the modeled rules, not the bank contract or the optimality of a plan.
"""
import json
import math
import sys


def validate(payload):
    c, result = payload['config'], payload['result']
    options = payload.get('options', {})
    programs = options.get('programs', [])
    reference = c.get('trCapitalizes') is False
    construction = 0 if reference else c.get('constructionMonths', 12)
    strategy = c['strategy']
    if strategy == 'Equilibrado':
        strategy = 'Misto'
        share = result.get('balancedPlan', {}).get('plrDebtShare', .5)
    else:
        share = c.get('plrDebtShare', 0)
    bank_mode = (c.get('currentFunds') is True and c.get('projectionAsOfDate')
                 and all(isinstance(c.get('bankBalances', {}).get(k), (int, float))
                         and c['bankBalances'][k] >= 0 for k in ('sofisa', 'itau')))
    weights = [0.] * construction
    for row in c['schedule'] if construction else []:
        idx = next((i for i, d in enumerate(c['dates']) if d[:7] >= row['month'][:7]), len(c['dates']))
        weights[min(construction - 1, idx)] += max(0, row['caixa'])
    if construction and not sum(weights):
        weights = [1.] * construction
    releases = [c['principal'] * w / sum(weights) for w in weights]
    debt = 0 if construction else c['principal']
    rates, initial_used, fgts_used, checked, maximum = [], 0, 0, 0, 0.
    source = c.get('fgtsProjection')
    source_month = source['asOfDate'][:7] if source else ''

    def check(actual, expected, label):
        nonlocal checked, maximum
        if not isinstance(actual, (int, float)) or not math.isfinite(actual):
            raise ValueError('Non-finite result: ' + label)
        delta = abs(actual - expected)
        maximum = max(maximum, delta)
        checked += 1
        if delta > .01:
            raise ValueError('Difference above tolerance: ' + label)

    def band(rows, key, field):
        return max((r for r in rows if r['threshold'] <= key), key=lambda r: r['threshold'])[field]

    for i, date in enumerate(c['dates']):
        date, m = date[:7], i + 1
        building = i < construction
        annual = next(r['annual'] for r in c['cdi'] if r['year'] == int(date[:4]))
        gross = (1 + annual * c['cdbShare']) ** (1 / 12) - 1
        net = gross * c['irFactors'][i]
        tbf = gross / c['cdbShare'] * c['tbfFactor']
        tr = max(0, (1 + tbf) / (band(c['trBands'], tbf, 'a') + band(c['trBands'], tbf, 'b') * tbf) - 1) if i else 0
        rates.append(tr)
        if i and math.floor(debt + .5) <= 0:
            debt = 0
        release = releases[i] if building else 0
        debt += release
        corrected = debt * (1 if reference else 1 + tr)
        interest = debt * (1 + tr) * ((1 + c['annualInterest']) ** (1 / 12) - 1) if debt > 0 else 0
        amortization = corrected / (c['term'] - m + 1) if debt > 0 and not building else 0
        mip = corrected * band(c['mipBands'], m, 'rate') if debt > 0 else 0
        paid = max(0, source.get('paid', {}).get(date, 0)) if source else 0
        if source and date >= source_month:
            initial_used += max(0, sum(r.get('fgts', 0) for r in c['schedule'] if r['month'][:7] == date) - source.get('initialPaid', {}).get(date, 0))
        if paid:
            fgts = paid
        elif debt > 0 and not building and m % 24 == 0:
            fgts = (max(0, source.get('balances', {}).get(date, 0) - initial_used - fgts_used)
                    if date >= source_month else 0) if source else c['biennialFgts'] * (1 + sum(rates[-12:]))
        else:
            fgts = 0
        skip = bool(bank_mode and c.get('skipCurrentUndatedInflows') and date == c['projectionAsOfDate'][:7])
        mixed = strategy == 'Misto'
        event = int(date[5:7]) == 4 if mixed else strategy == 'Finan' and m % 12 == 0
        plr = c['plr'] * (share if mixed else 1) if event and debt > 0 and not building and not (mixed and skip) else 0
        active = [p for p in programs if p['inicio'] <= m <= p['fim']]
        explicit = sum(p['valor'] for p in active if p['tipo'] == 'amortizacao') if not building and not skip else 0
        automatic = sum(p['valor'] for p in active if p['tipo'] == 'automatico' or p['tipo'] == 'extra' and c.get('autoExtras') is not False) if not skip else 0
        marginal = ((1 + tr) * (1 + ((1 + c['annualInterest']) ** (1 / 12) - 1)) - 1
                    + (1 + tr) * band(c['mipBands'], m, 'rate')) if debt > 0 else 0
        capacity = max(0, corrected - amortization)
        auto_debt = min(max(0, capacity - min(capacity, fgts + plr + explicit)), automatic) if not building and net <= marginal and debt > 0 else 0
        limit = debt + tr + interest + amortization if reference else capacity
        extra = min(limit, fgts + plr + explicit + auto_debt) if debt > 0 else 0
        installment = ((interest + amortization + mip + c['dfi'] + c['admin']) if debt > 0
                       else c['dfi'] + c['admin'] if building else 0) + (corrected - debt if building else 0)
        closing = max(0, (debt if building else corrected) - amortization - extra) if debt > 0 else 0
        expected = dict(C=debt, D=tr, E=interest, F=amortization, G=mip, K=extra, L=installment, M=closing,
                        release=release, correctedDebt=corrected, correction=corrected-debt)
        for key, value in expected.items():
            check(result['sac'][i][key], value, 'SAC ' + str(m) + ' ' + key)
        if source and date >= source_month:
            fgts_used += max(0, min(fgts, extra) - paid)
        cash = result['cash'][i]
        if not cash.get('historical'):
            applied_plr = min(plr, extra if reference else max(0, extra - fgts))
            plr_cash = 0
            if not skip:
                if mixed and int(date[5:7]) == 4:
                    plr_cash = c['plr'] * (1 - (share if debt > 0 and not building else 0)) * c['plrCashFactor'] + max(0, plr - applied_plr)
                elif strategy == 'CDB' and int(date[5:7]) == 4:
                    plr_cash = c['plr'] * c['plrCashFactor']
                elif strategy == 'Finan' and m % 12 == 0 and (building or not reference and debt <= 0):
                    plr_cash = c['plr']
            if not reference and not mixed:
                plr_cash += max(0, plr - applied_plr)
            requested = sum(p['valor'] for p in active if p['tipo'] == 'amortizacao') if not skip else 0
            program_refund = max(0, explicit - max(0, min(capacity, fgts + plr + explicit) - fgts - plr)) if not reference else 0
            parked = requested if building else 0
            extra_cash = sum(p['valor'] for p in active if p['tipo'] == 'extra' and c.get('autoExtras') is False) if not skip else 0
            check(cash['G'], plr_cash + extra_cash + automatic - auto_debt + parked + program_refund, 'external cash sources ' + str(m))
            check(cash['plrToDebt'], applied_plr, 'PLR debt ' + str(m))
            check(cash['plrToReserve'], plr_cash, 'PLR reserve ' + str(m))
            raw = cash['C'] + cash['E'] + cash['F'] + cash['G'] + cash['manualIn'] - cash['H'] - cash['manualOut'] - cash['deferredPayment']
            shortfall = max(0, -raw) if c.get('currentFunds') else 0
            check(cash['unfunded'], shortfall, 'cash shortfall ' + str(m))
            check(cash['I'], raw + shortfall, 'cash closing ' + str(m))
            if cash.get('bankClosing'):
                check(sum(cash['bankClosing'].values()), cash['I'], 'banks ' + str(m))
                if min(cash['bankClosing'].values()) < -.005:
                    raise ValueError('Negative bank reserve')
        debt = closing
    return dict(passed=True, months=len(c['dates']), checked=checked, maxDifference=maximum,
                coverage='independent_SAC_sources_and_cash_conservation')


if __name__ == '__main__':
    try:
        with open(sys.argv[1], encoding='utf-8') if len(sys.argv) > 1 else sys.stdin as stream:
            print(json.dumps(validate(json.load(stream))))
    except (ValueError, KeyError, StopIteration, ZeroDivisionError) as error:
        # No parameter values or financial rows are printed on failure.
        print(json.dumps(dict(passed=False, error=str(error))))
        sys.exit(1)
