
import { Outlet } from 'react-router-dom';
import { Timer } from 'lucide-react';

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Timer className="h-8 w-8 text-brand-600" />
                        <span className="font-bold text-xl tracking-tight text-slate-900">RegistroEventos</span>
                    </div>
                    {/* Aquí podrías agregar navegación si se requiere (Admin, etc) */}
                </div>
            </header>

            <main className="flex-grow">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <Outlet />
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-300 py-8 text-center mt-auto">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-sm">
                        © {new Date().getFullYear()} TCT Colombia, Innovando el cronometraje electrónico colombiano.
                    </p>
                </div>
            </footer>
        </div>
    );
};
