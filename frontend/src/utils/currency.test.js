import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatMoney,
  resolveCurrencyCode,
  MONEDA_DEFAULT,
} from './currency.js'

describe('currency Sprint C', () => {
  it('resolveCurrencyCode usa USD ante vacío o inválido', () => {
    assert.equal(resolveCurrencyCode(null), MONEDA_DEFAULT)
    assert.equal(resolveCurrencyCode(''), MONEDA_DEFAULT)
    assert.equal(resolveCurrencyCode('xx'), MONEDA_DEFAULT)
    assert.equal(resolveCurrencyCode('DOLAR'), MONEDA_DEFAULT)
  })

  it('resolveCurrencyCode normaliza códigos soportados', () => {
    assert.equal(resolveCurrencyCode('cop'), 'COP')
    assert.equal(resolveCurrencyCode('EUR'), 'EUR')
    assert.equal(resolveCurrencyCode('PEN'), 'PEN')
    assert.equal(resolveCurrencyCode('MXN'), 'MXN')
  })

  it('formatMoney incluye código de moneda (no solo símbolo)', () => {
    const usd = formatMoney(1234.5, 'USD')
    assert.match(usd, /USD/)
    assert.match(usd, /1[,.]?234/)

    const cop = formatMoney(10000, 'COP')
    assert.match(cop, /COP/)
  })

  it('formatMoney con signed añade prefijo', () => {
    const pos = formatMoney(10, 'USD', { signed: true })
    const neg = formatMoney(-10, 'USD', { signed: true })
    assert.match(pos, /^\+/)
    assert.match(neg, /^-/)
  })

  it('formatMoney ante código basura cae a USD', () => {
    const out = formatMoney(50, '!!!')
    assert.match(out, /USD/)
  })

  it('formatMoney trata NaN como 0', () => {
    const out = formatMoney('no-num', 'EUR')
    assert.match(out, /EUR/)
    assert.match(out, /0/)
  })
})
