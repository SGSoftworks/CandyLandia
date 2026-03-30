import React, { useState } from 'react';
import { useCashControl } from './hooks/useCashControl';
import { Ticket, CreditCard, Banknote, RefreshCcw, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

const InputRow = ({ label, value, onChange, icon: Icon, prefix }: any) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 text-slate-700 font-medium">
      <Icon className="w-4 h-4 text-rose-500" />
      <label className="text-sm">{label}</label>
    </div>
    <div className="relative w-1/2 xs:w-1/3">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value === 0 ? '' : value}
        onChange={onChange}
        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-semibold ${prefix ? 'pl-8' : ''}`}
        placeholder="0"
      />
    </div>
  </div>
);

function App() {
  const { state, actions, calculated } = useCashControl();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearConfirm = () => {
    actions.resetForm();
    setShowClearModal(false);
  };

  const handleInputChange = (field: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // only allow digits
    actions.updateField(field, parseInt(value, 10));
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans text-slate-800 selection:bg-rose-200">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <div className="bg-rose-50 p-1 rounded-full overflow-hidden w-12 h-12 flex items-center justify-center border border-rose-100 shadow-sm shadow-rose-200/50">
            <img src="/logo.png" alt="Candy Landia Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Candy Landia - Caja
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Inventario & Promociones */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Fichas & Promos</h2>
          </div>
          <div className="p-4 space-y-1">
            <InputRow label="Total Fichas Entregadas" icon={Ticket} value={state.fichasEntregadas} onChange={handleInputChange('fichasEntregadas')} />
            <InputRow label="Promo 1 (13 x $20k)" icon={Ticket} value={state.combo1Qty} onChange={handleInputChange('combo1Qty')} />
            <InputRow label="Promo 2 (25 x $40k)" icon={Ticket} value={state.combo2Qty} onChange={handleInputChange('combo2Qty')} />
            <InputRow label="Promo 3 (38 x $60k)" icon={Ticket} value={state.combo3Qty} onChange={handleInputChange('combo3Qty')} />
          </div>
          <div className="bg-indigo-50/50 px-4 py-3 border-t border-indigo-100 flex justify-between text-sm border-b border-indigo-100/50">
            <span className="text-indigo-800 font-medium">Fichas en Promos:</span>
            <span className="text-indigo-900 font-bold">{calculated.fichasDeCombos}</span>
          </div>
          <div className="bg-indigo-50/50 px-4 py-3 flex justify-between text-sm">
            <span className="text-indigo-800 font-medium">Venta Promos:</span>
            <span className="text-indigo-900 font-bold">{formatCurrency(calculated.ventaTotalPromos)}</span>
          </div>
          <div className="px-4 py-3 border-t border-indigo-100 flex justify-between text-sm bg-white">
            <span className="text-slate-600">Fichas Indiv. Restantes:</span>
            <span className="font-bold text-slate-800">{calculated.fichasIndividualesCount}</span>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex justify-between text-sm bg-slate-50">
            <span className="text-slate-700 font-medium">Venta Fichas Indiv:</span>
            <span className="font-bold text-slate-900">{formatCurrency(calculated.ventaFichasIndividuales)}</span>
          </div>
        </section>

        {/* Pagos BOLD */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-slate-800">Pagos BOLD</h2>
          </div>
          <div className="p-4 space-y-1">
            <InputRow label="Nequi" prefix="$" icon={CreditCard} value={state.nequi} onChange={handleInputChange('nequi')} />
            <InputRow label="Tarjeta Débito" prefix="$" icon={CreditCard} value={state.tarjetaDebito} onChange={handleInputChange('tarjetaDebito')} />
            <InputRow label="Tarjeta Crédito" prefix="$" icon={CreditCard} value={state.tarjetaCredito} onChange={handleInputChange('tarjetaCredito')} />
          </div>
          <div className="bg-emerald-50/50 px-4 py-3 border-t border-emerald-100 flex justify-between text-sm">
            <span className="text-emerald-800 font-medium">Total BOLD:</span>
            <span className="text-emerald-900 font-bold">{formatCurrency(calculated.totalBold)}</span>
          </div>
        </section>

        {/* Efectivo Físico */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-800">Efectivo en Caja</h2>
          </div>
          <div className="p-4 space-y-1">
            <InputRow label="Desembolsos (Retirado)" prefix="$" icon={Banknote} value={state.desembolsos} onChange={handleInputChange('desembolsos')} />
            <InputRow label="Efectivo Físico Actual" prefix="$" icon={Banknote} value={state.efectivoFisico} onChange={handleInputChange('efectivoFisico')} />
          </div>
        </section>

        {/* Resumen Final */}
        <section className="bg-slate-800 text-white rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm text-slate-300">
              <span className="flex items-center gap-2">Venta Bruta Total </span>
              <span className="font-semibold">{formatCurrency(calculated.ventaBrutaTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-300">
              <span className="flex items-center gap-2">Total BOLD</span>
              <span className="font-semibold text-emerald-400">-{formatCurrency(calculated.totalBold)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-rose-300">
              <span className="flex items-center gap-2">Desembolsos (Retirado)</span>
              <span className="font-semibold text-rose-400">-{formatCurrency(state.desembolsos)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-slate-300">
              <span className="flex items-center gap-2">Efectivo Esperado</span>
              <span className="font-semibold">{formatCurrency(calculated.efectivoEsperado)}</span>
            </div>
            <div className="pt-3 border-t border-slate-600 flex justify-between items-center">
              <span className="font-medium text-slate-200">
                {calculated.diferencia > 0 ? 'Sobrante' : calculated.diferencia < 0 ? 'Faltante' : 'Dinero Completo'}
              </span>
              <div className={`flex items-center gap-2 text-lg font-bold ${calculated.diferencia >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calculated.diferencia >= 0 ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                {formatCurrency(Math.abs(calculated.diferencia))}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Acciones Flotantes */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={() => setShowClearModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
            Limpiar
          </button>
          <a
            href={`https://wa.me/?text=${actions.generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-green-500 hover:bg-green-600 active:bg-green-700 transition-colors shadow-sm shadow-green-500/30"
          >
            <Send className="w-5 h-5" />
            Enviar Reporte
          </a>
        </div>
      </div>

      {/* Modal de Confirmación Limpiar */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">¿Limpiar turno actual?</h3>
              <p className="text-slate-500 text-sm">Estás a punto de borrar todos los datos ingresados. Esta acción no se puede deshacer de ninguna forma.</p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
              <button 
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleClearConfirm}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-rose-500 hover:bg-rose-600 active:bg-rose-700 transition-colors shadow-sm"
              >
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
