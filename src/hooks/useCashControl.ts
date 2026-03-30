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
    const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    
    let estadoFinal = '';
    if (diferencia > 0) {
      estadoFinal = `🟢 *SOBRANTE:* ${formatCurrency(Math.abs(diferencia))}`;
      if (diferencia === totalBold && totalBold > 0) {
        estadoFinal += '\n💡 _Nota: El sobrante es exactamente igual a los pagos BOLD. Verifica si anotaste un pago digital que al final cobraste en efectivo._';
      }
    } else if (diferencia < 0) {
      estadoFinal = `🔴 *FALTANTE:* ${formatCurrency(Math.abs(diferencia))}`;
      if (Math.abs(diferencia) === state.desembolsos && state.desembolsos > 0) {
        estadoFinal += '\n💡 _Nota: El faltante es exactamente igual a los retiros. Recuerda que los desembolsos restan dinero físico._';
      }
    } else {
      estadoFinal = `✅ *DINERO COMPLETO (Cuadrado a la perfección)*`;
    }

    const message = `*Cierre de Caja - Candy Landia* 🍭🎡

🎫 *INVENTARIO DE FICHAS*
• Repartidas en total: ${state.fichasEntregadas}
• Fichas en Promos: ${fichasDeCombos}
• Fichas Individuales: ${fichasIndividualesCount}
_(Promos vendidas: ${state.combo1Qty} C1, ${state.combo2Qty} C2, ${state.combo3Qty} C3)_

💰 *VENTAS DEL DÍA*
• Por Individuales: ${formatCurrency(ventaFichasIndividuales)}
• Por Promociones: ${formatCurrency(ventaTotalPromos)}
👉 *Venta Bruta Total: ${formatCurrency(ventaBrutaTotal)}*

💳 *MEDIOS DE PAGO (BOLD)*
• Nequi: ${formatCurrency(state.nequi)}
• Débito: ${formatCurrency(state.tarjetaDebito)}
• Crédito: ${formatCurrency(state.tarjetaCredito)}
👉 *Total BOLD: ${formatCurrency(totalBold)}*

💸 *GASTOS / RETIROS*
• Desembolsos: ${formatCurrency(state.desembolsos)}

⚖️ *ARQUEO DE CAJA*
• Ventas (Bruto): ${formatCurrency(ventaBrutaTotal)}
• (-) Pagos BOLD: ${formatCurrency(totalBold)}
==================
• Efectivo Esperado: ${formatCurrency(efectivoEsperado)}
• Efectivo Físico: ${formatCurrency(state.efectivoFisico)}
• (-) Desembolsos: ${formatCurrency(state.desembolsos)}

📊 *RESULTADO:*
${estadoFinal}`;

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
