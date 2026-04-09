
import { Outlet } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-4 z-50 mx-4 sm:mx-8 mt-4 rounded-3xl border border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src={logoUrl} 
                            alt="TCT Colombia" 
                            className="h-10 w-auto object-contain drop-shadow-sm"
                        />
                        <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline-block">RegistroEventos</span>
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
