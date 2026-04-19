import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import type { EventConfig, Participant } from '../types';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Button } from '../components/Button';
import { AlertCircle, CheckCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
    const [eventDetails, setEventDetails] = useState<EventConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [registeredData, setRegisteredData] = useState<Participant | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Participant>();

    const watchPaymentMethod = watch('payment_method');

    useEffect(() => {
        fetchEventDetails();
    }, []);

    const fetchEventDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('event_config')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;

            const mappedEvent: EventConfig = {
                id: data.id,
                eventName: data.eventname || data.event_name || data.eventName || '',
                eventDescription: data.eventdescription || data.event_description || data.eventDescription || '',
                activeCategories: data.activecategories || data.active_categories || data.activeCategories || [],
                registration_close_date: data.registration_close_date || data.close_date || '',
                nequi_number: data.nequi_number || '',
                daviplata_number: data.daviplata_number || '',
            };

            setEventDetails(mappedEvent);
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: Participant) => {
        if (!eventDetails) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            const participantData = {
                ...data,
                event_id: eventDetails.id,
            };

            const { error } = await supabase
                .from('participants')
                .insert([participantData]);

            if (error) {
                if (error.code === '23505') {
                    throw new Error('Ya existe un registro con este número de documento o correo electrónico para este evento.');
                }
                throw error;
            }

            setRegisteredData(participantData);
            setSuccess(true);
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setSubmitError(error.message || 'Ocurrió un error al procesar tu inscripción.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!eventDetails) {
        return (
            <div className="text-center py-12 glass rounded-2xl">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900">No hay eventos activos</h2>
                <p className="mt-2 text-slate-600">Por el momento no tenemos eventos disponibles para inscripción.</p>
            </div>
        );
    }

    // Comprobar si la fecha de cierre ya pasó
    const isClosed = eventDetails.registration_close_date && new Date(eventDetails.registration_close_date) < new Date();

    if (isClosed) {
        return (
            <div className="text-center py-12 glass rounded-2xl">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900">Inscripciones Cerradas</h2>
                <p className="mt-2 text-slate-600">El período de inscripción para {eventDetails.eventName} ha finalizado.</p>
            </div>
        );
    }

    if (success && registeredData) {
        const docInfo = `*Tus datos de registro:*\n👤 Nombre: ${registeredData.fullname}\n🆔 Documento: ${registeredData.documentnumber}\n🏷️ Categoría: ${registeredData.category}\n💳 Pago: ${registeredData.payment_method || 'Ninguno'} - Ref: ${registeredData.payment_id || 'N/A'}\n\n`;
        const whatsappMessage = encodeURIComponent(
            `*COMPROBANTE DE INSCRIPCIÓN* 🏆\n¡Hola ${registeredData.fullname}! Te has inscrito exitosamente a *${eventDetails.eventName}*.\n\n` +
            docInfo +
            `Guarda este mensaje como constancia de tu registro oficial.`
        );
        const whatsappUrl = `https://wa.me/${registeredData.mobile.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

        return (
            <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-in">
                <div className="glass p-8 rounded-2xl shadow-xl border-green-100">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Inscripción Exitosa!</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Tu registro para <strong>{eventDetails.eventName}</strong> ha sido guardado correctamente.
                    </p>

                    <div className="space-y-4">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full h-12 px-6 font-medium text-white transition-colors bg-[#25D366] rounded-xl hover:bg-[#1ebe55] shadow-lg shadow-[#25D366]/30"
                        >
                            Guardar constancia en mi WhatsApp
                        </a>

                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl"
                            onClick={() => window.location.reload()}
                        >
                            Realizar otra inscripción
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl drop-shadow-sm">
                    {eventDetails.eventName}
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-slate-600 whitespace-pre-line">
                    {eventDetails.eventDescription}
                </p>
                <div className="pt-4 flex justify-center">
                    <Link
                        to="/registrations"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-full transition-all border border-brand-200 shadow-sm hover:shadow-md"
                    >
                        <Users className="w-5 h-5" />
                        Ver Lista de Deportistas Inscritos
                    </Link>
                </div>
            </div>

            <div className="glass p-6 sm:p-10 rounded-3xl shadow-2xl mt-12 relative overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                    {submitError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{submitError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Información Personal</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Input
                                label="Documento de Identidad"
                                placeholder="Ej. 1020304050"
                                required
                                register={register('documentnumber', {
                                    required: 'El documento es obligatorio',
                                    minLength: { value: 6, message: 'El documento debe tener al menos 6 dígitos' }
                                })}
                                error={errors.documentnumber?.message}
                            />

                            <Input
                                label="Nombre Completo"
                                placeholder="Ej. Juan Pérez"
                                required
                                register={register('fullname', {
                                    required: 'El nombre es obligatorio',
                                    minLength: { value: 5, message: 'Ingresa tu nombre completo' }
                                })}
                                error={errors.fullname?.message}
                            />

                            <Input
                                label="Correo Electrónico"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                register={register('email', {
                                    required: 'El correo es obligatorio',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Dirección de correo inválida"
                                    }
                                })}
                                error={errors.email?.message}
                            />

                            <Input
                                label="Teléfono Celular"
                                type="tel"
                                placeholder="Ej. 3001234567"
                                required
                                register={register('mobile', {
                                    required: 'El celular es obligatorio',
                                    minLength: { value: 10, message: 'Ingrese un número de celular válido de 10 dígitos' },
                                    pattern: { value: /^[0-9]+$/, message: 'Solo se permiten números' }
                                })}
                                error={errors.mobile?.message}
                            />

                            <Input
                                label="Fecha de Nacimiento"
                                type="date"
                                required
                                register={register('dob', {
                                    required: 'La fecha es obligatoria',
                                    validate: value => {
                                        const date = new Date(value);
                                        const now = new Date();
                                        const age = now.getFullYear() - date.getFullYear();
                                        return age >= 10 || 'Debes tener al menos 10 años para participar';
                                    }
                                })}
                                error={errors.dob?.message}
                            />

                            <Select
                                label="Género"
                                required
                                options={[
                                    { value: 'M', label: 'Masculino' },
                                    { value: 'F', label: 'Femenino' },
                                ]}
                                register={register('gender', { required: 'Selecciona una opción' })}
                                error={errors.gender?.message}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Datos del Evento</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Select
                                label="Categoría"
                                required
                                options={(eventDetails.activeCategories || []).map((cat: string) => ({ value: cat, label: cat }))}
                                register={register('category', { required: 'La categoría es obligatoria' })}
                                error={errors.category?.message}
                            />

                            <Input
                                label="Número de Licencia (Opcional)"
                                placeholder="Ej. LIC-12345"
                                register={register('licensenumber')}
                            />

                            <Input
                                label="Club (Opcional)"
                                placeholder="Ej. Club Ciclista"
                                register={register('club')}
                            />

                            <Input
                                label="Patrocinador (Opcional)"
                                placeholder="Ej. Sports Brand"
                                register={register('sponsor')}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Información de Pago</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Select
                                label="Método de Pago"
                                required
                                options={[
                                    { value: '', label: 'Selecciona una opción...' },
                                    { value: 'Nequi', label: 'Nequi' },
                                    { value: 'Daviplata', label: 'Daviplata' },
                                ]}
                                register={register('payment_method', { required: 'Selecciona un método de pago' })}
                                error={errors.payment_method?.message}
                            />

                            <Input
                                label="Referencia o ID del Pago"
                                placeholder="Ej. 123456789"
                                required
                                register={register('payment_id', {
                                    required: 'El ID de pago es obligatorio'
                                })}
                                error={errors.payment_id?.message}
                            />
                        </div>

                        {watchPaymentMethod === 'Nequi' && eventDetails.nequi_number && (
                            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-fuchsia-50 to-pink-50 border border-fuchsia-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-xl shadow-sm border border-fuchsia-100 z-10">
                                    <div className="font-bold text-fuchsia-600 tracking-tight flex items-center justify-center w-12 h-8">NEQUI</div>
                                </div>
                                <div className="text-center sm:text-left z-10">
                                    <p className="text-fuchsia-900 font-medium">Realiza tu transferencia Nequi al número:</p>
                                    <div className="text-fuchsia-600 font-extrabold text-3xl tracking-widest my-1 drop-shadow-sm">
                                        {eventDetails.nequi_number}
                                    </div>
                                    <p className="text-sm text-fuchsia-800/70">Una vez realizada, ingresa el número de comprobante o ID de transacción completo en la casilla superior para validar tu inscripción.</p>
                                </div>
                            </div>
                        )}

                        {watchPaymentMethod === 'Daviplata' && eventDetails.daviplata_number && (
                            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-4 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                                <div className="flex-shrink-0 mt-1 bg-white p-2 rounded-xl shadow-sm border border-red-100 z-10">
                                    <div className="font-bold text-red-600 tracking-tight flex items-center justify-center px-1 h-8 text-xs">DAVIPLATA</div>
                                </div>
                                <div className="text-center sm:text-left z-10">
                                    <p className="text-red-900 font-medium">Realiza tu transferencia Daviplata al número:</p>
                                    <div className="text-red-600 font-extrabold text-3xl tracking-widest my-1 drop-shadow-sm">
                                        {eventDetails.daviplata_number}
                                    </div>
                                    <p className="text-sm text-red-800/70">Una vez ejecutada la transacción, anota el código de aprobación detallado en la casilla de Referencia.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl transition-all duration-300"
                            isLoading={submitting}
                            disabled={submitting}
                        >
                            {submitting ? 'Procesando Inscripción...' : 'Inscribirme Ahora'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
