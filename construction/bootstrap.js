'use strict';
if(parent===window||!parent.ConstructionHost)throw Error('Abra Construção dentro do Controle Financeiro.');
ConstructionMigration.local(localStorage,parent.ConstructionHost.seed());
