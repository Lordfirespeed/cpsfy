const test = require('./config')
const { scan, scanS } = require('..')

test('scan over single callback output', t => {
	const reducer = (acc, x) => acc + x
	const cpsFun = cb => cb(42)
	t.plan(1)
	scan(reducer, 10)(cpsFun)(t.cis(52))
})
test('scan over single repeated callback output', t => {
	let called = false
	const reducer = (acc, x) => acc + x
	const cpsFun = cb => { cb(2); cb(8) }
	const newCps = scan(reducer, 10)(cpsFun)

	// called twice with 
	// 12 = 10 + 2 and 20 = 10 + 2 + 8 as outputs
	t.plan(2)
	newCps(res => {
		t.cis(called ? 20 : 12)(res)
		called = true
	})	
})
test('scan over outputs from 2 callbacks', t => {
	const r = (acc, x) => acc + x
	const cpsFun = (cb1, cb2) => {cb1(2); cb2(3)}
	const newCps = scan(r, r, 10)(cpsFun)
	// called with 12 = 10 + 2 and 15 = 12 + 3
	t.plan(2)
	let count = 0
	newCps(res => t.cis(count++ === 0 ? 10+2 : 10+2+3)(res))	
})
test('scan with multiple functions applies each to the same seed', t=>{
	const r1=(acc, x) => acc + x, r2=(acc, x) => acc * x
	const cpsFun = (cb1, cb2) => {cb1(2); cb2(3)}
	const cpsFun1 = (cb1, cb2) => {cb2(2); cb1(3)}
	const newCps = scan(r1, r2, 10)(cpsFun)
	const newCps1 = scan(r1, r2, 10)(cpsFun1)
	// called with 12 = 10 + 2, then 36 = 12 * 3
	t.plan(4)
	let count = 0
	newCps(res => t.cis(count++ === 0 ? 10+2 : (10+2)*3)(res))
	count = 0
	newCps1(res => t.cis(count++ === 0 ? 10*2 : (10*2)+3)(res))
})
test('scan throws with fewer than 2 args', t=>{
	t.throws(_=>scan())
	t.throws(_=>scan(1))
})

test('scanN implies seed=undefined', t => {
	const reducer = (acc=10, x) => acc + x
	const cpsFun = cb => cb(42)
	t.plan(1)
	scanS(reducer)(cpsFun)(t.cis(52))
})
test('scanN works with multiple args with seed=undefined implied', t => {
	const r1=(acc=0, x) => acc + x, r2=(acc=1, x) => acc * x
	const cpsFun = (c1,c2) => {c1(10);c2(20)}
	t.plan(2)
	let count = 0
	scanS(r1,r2)(cpsFun)(res => t.cis(count++ === 0 ? 0+10 : (0+10)*20)(res))
})

