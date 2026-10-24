const test=require('node:test'),assert=require('node:assert/strict'),M=require('../month-inputs');
test('aceita ano completo e mês válido',()=>{for(const value of ['2026-01','2036-02','2044-12'])assert.equal(M.validMonth(value),true)});
test('rejeita ano parcial, vazio e mês inválido antes de atualizar os filtros',()=>{for(const value of ['0002-12','0020-12','0202-12','202-12','20260-12','','2026-00','2026-13'])assert.equal(M.validMonth(value),false)});
