import { useState, useEffect } from 'react';

export interface CashControlState {
  fichasEntregadas: number;
  combo1Qty: number;
  combo2Qty: number;
  combo3Qty: number;
  nequi: number;
  tarjetaDebito: number;
  tarjetaCredito: number;
  desembolsos: number;
  efectivoFisico: number;
}

const initialState: CashControlState = {
  fichasEntregadas: 0,
  combo1Qty: 0,
  combo2Qty: 0,
  combo3Qty: 0,
  nequi: 0,
  tarjetaDebito: 0,
  tarjetaCredito: 0,
  desembolsos: 0,
  efectivoFisico: 0,
};

export const useCashControl = () => {
  const [state, setState] = useState<CashControlState>(() => {
    const saved = localStorage.getItem('candylandia-cash-control');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('candylandia-cash-control', JSON.stringify(state));
  }, [state]);

  const updateField = (field: keyof CashControlState, value: number) => {
    setState((prev) => ({ ...prev, [field]: isNaN(value) ? 0 : value }));
  };

  const resetForm = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
      setState(initialState);
    }
  };

  // Derived Calculations
  const fichasDeCombos =
    (state.combo1Qty * 13) +
    (state.combo2Qty * 25) +
    (state.combo3Qty * 38);

  const fichasIndividualesCount = Math.max(0, state.fichasEntregadas - fichasDeCombos);
  const ventaFichasIndividuales = fichasIndividualesCount * 2000;

  const ventaTotalPromos =
    (state.combo1Qty * 20000) +
    (state.combo2Qty * 40000) +
    (state.combo3Qty * 60000);

  const ventaBrutaTotal = ventaFichasIndividuales + ventaTotalPromos;

  const totalBold = state.nequi + state.tarjetaDebito + state.tarjetaCredito;

  const efectivoEsperado = ventaBrutaTotal - totalBold;
  const diferencia = state.efectivoFisico - efectivoEsperado - state.desembolsos;

  const generateWhatsAppMessage = () => {
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(val);

    const message = `*Cierre de Caja - Candy Landia* 🍭🎡
    
*Desglose Fichas:*
- Entregadas: ${state.fichasEntregadas}
- Promos Vendidas: ${state.combo1Qty} (13x20k), ${state.combo2Qty} (25x40k), ${state.combo3Qty} (38x60k)
- Fichas en Promos: ${fichasDeCombos}
- Fichas Indiv: ${fichasIndividualesCount}

*Ingresos:*
- Venta Fichas Indiv: ${formatCurrency(ventaFichasIndividuales)}
- Venta Promos: ${formatCurrency(ventaTotalPromos)}
- *Venta Bruta Total: ${formatCurrency(ventaBrutaTotal)}*

*BOLD / Otros:*
- Nequi: ${formatCurrency(state.nequi)}
- Débito: ${formatCurrency(state.tarjetaDebito)}
- Crédito: ${formatCurrency(state.tarjetaCredito)}
- Total BOLD: ${formatCurrency(totalBold)}
- Desembolsos: ${formatCurrency(state.desembolsos)}

*Arqueo Físico:*
- Efectivo Físico: ${formatCurrency(state.efectivoFisico)}
- Efectivo Esperado: ${formatCurrency(efectivoEsperado)}
- *${diferencia > 0 ? 'Sobrante' : diferencia < 0 ? 'Faltante' : 'Dinero Completo'}: ${formatCurrency(Math.abs(diferencia))}* ${diferencia >= 0 ? '🟢' : '🔴'}`;

    return encodeURIComponent(message);
  };

  const actions = {
    updateField,
    resetForm,
    generateWhatsAppMessage
  };

  const calculated = {
    fichasDeCombos,
    fichasIndividualesCount,
    ventaFichasIndividuales,
    ventaTotalPromos,
    ventaBrutaTotal,
    totalBold,
    efectivoEsperado,
    diferencia
  };

  return { state, actions, calculated };
};
