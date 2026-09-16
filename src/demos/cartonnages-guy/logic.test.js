import test from 'node:test';
import assert from 'node:assert/strict';
import { inspect,initial } from './model.js';
test('format maximum 106, pas 102',()=>assert.deepEqual(inspect(initial).results.map(m=>m.fits),[true,false]));
test('rotation de feuille et limites minimum',()=>{assert.equal(inspect({...initial,width:'45',height:'32.5'}).results[0].fits,true);assert.equal(inspect({...initial,width:'32',height:'45'}).results[0].fits,false);});
test('collage bas grammage et nombre entier',()=>{assert.match(inspect({...initial,gsm:'150'}).warnings.join(' '),/200/);assert.equal(inspect({...initial,quantity:'2.5'}).valid,false);assert.equal(inspect({...initial,width:''}).valid,false);});
