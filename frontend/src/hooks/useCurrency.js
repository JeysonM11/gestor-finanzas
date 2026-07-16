import { useCallback, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  formatMoney as formatMoneyUtil,
  resolveCurrencyCode,
  MONEDA_DEFAULT,
} from '../utils/currency'

/**
 * Moneda operativa del usuario (preferencia en Configuración).
 * Usar formatMoney para montos globales; pasar `currency` explícito
 * cuando el monto pertenece a una cuenta concreta (no convertir en silencio).
 */
export function useCurrency() {
  const { user } = useAuth()
  const currency = resolveCurrencyCode(user?.monedaPrincipal || MONEDA_DEFAULT)

  const formatMoney = useCallback(
    (amount, currencyOverride, options) =>
      formatMoneyUtil(
        amount,
        currencyOverride != null ? currencyOverride : currency,
        options
      ),
    [currency]
  )

  const formatSigned = useCallback(
    (amount, currencyOverride) =>
      formatMoneyUtil(
        amount,
        currencyOverride != null ? currencyOverride : currency,
        { signed: true }
      ),
    [currency]
  )

  return useMemo(
    () => ({ currency, formatMoney, formatSigned }),
    [currency, formatMoney, formatSigned]
  )
}
