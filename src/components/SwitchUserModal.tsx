import React from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { School, Check, Sparkles, GraduationCap, ClipboardCheck } from 'lucide-react';

interface SwitchUserModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-300 rounded-xl max-w-lg w-full p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 p-1 rounded font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-1.5 mb-1 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Cambio de Perfil Escolar</span>
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">
          Seleccionar Usuario de Prueba (I.P.E.T. N° 247)
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          Compruebe la diferencia entre el <strong>Módulo de Profesores</strong> (sólo pueden asentar sus materias asignadas) y el <strong>Módulo de Preceptoría</strong> (asistencia general y libros de aula).
        </p>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {INITIAL_USERS.map(user => {
            const isCurrent = user.id === currentUser.id;
            const isProf = user.role === 'profesor';

            return (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-blue-50 border-[#143254] shadow-xs ring-1 ring-[#143254]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                      isProf ? 'bg-[#143254]' : 'bg-[#965214]'
                    }`}
                  >
                    {isProf ? <GraduationCap className="w-5 h-5 text-amber-300" /> : <ClipboardCheck className="w-5 h-5 text-amber-300" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{user.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-[#143254] text-white px-1.5 py-0.2 rounded font-semibold">
                          Actual
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <span className={isProf ? 'text-blue-900 font-bold' : 'text-amber-900 font-bold'}>
                        {isProf ? 'Profesor/a (Cátedras Técnicas)' : 'Preceptor/a (Asistencia General)'}
                      </span>{' '}
                      • Turno {user.turn}
                    </div>
                  </div>
                </div>

                {isCurrent && <Check className="w-5 h-5 text-[#143254] shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
