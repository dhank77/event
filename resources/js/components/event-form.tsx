import { useForm } from '@inertiajs/react';
import {
    Calendar,
    Globe,
    GripVertical,
    Image,
    Info,
    MapPin,
    MonitorPlay,
    Plus,
    Ticket,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AgendaItem = {
    id?: number;
    time: string;
    title: string;
    description: string;
    speaker: string;
};

export type SpeakerItem = {
    id?: number;
    name: string;
    title: string;
    bio: string;
    avatar?: File | string | null;
    avatarPreview?: string;
};

export type SponsorItem = {
    id?: number;
    name: string;
    website: string;
    tier: string;
    logo?: File | string | null;
    logoPreview?: string;
};

export type EventFormData = {
    title: string;
    description: string;
    category: string;
    type: 'online' | 'offline' | 'hybrid';
    status: 'draft' | 'published' | 'cancelled';
    location: string;
    maps_url: string;
    online_platform: string;
    online_url: string;
    starts_at: string;
    ends_at: string;
    max_attendees: string;
    banner?: File | null;
    agendas: AgendaItem[];
    speakers: SpeakerItem[];
    sponsors: SponsorItem[];
};


type Step = {
    id: string;
    label: string;
    icon: React.ElementType;
};

const STEPS: Step[] = [
    { id: 'info', label: 'Info Dasar', icon: Info },
    { id: 'location', label: 'Lokasi', icon: MapPin },
    { id: 'agenda', label: 'Agenda & Speakers', icon: Users },
    { id: 'sponsors', label: 'Sponsor', icon: Globe },
    { id: 'publish', label: 'Publikasi', icon: Calendar },
];

const EVENT_CATEGORIES = [
    'Konferensi', 'Workshop', 'Webinar', 'Seminar', 'Bootcamp',
    'Networking', 'Festival', 'Kompetisi', 'Pameran', 'Lainnya',
];

const PLATFORMS = ['Zoom', 'Google Meet', 'YouTube Live', 'Instagram Live', 'TikTok Live', 'Lainnya'];

interface EventFormProps {
    defaultValues: Partial<EventFormData>;
    action: string;
    method: 'post' | 'put' | 'patch';
    submitLabel: string;
}

export function EventForm({ defaultValues, action, method, submitLabel }: EventFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [bannerPreview, setBannerPreview] = useState<string | null>(
        defaultValues.banner && typeof defaultValues.banner === 'string'
            ? `/storage/${defaultValues.banner}`
            : null,
    );

    const { data, setData, processing, errors, post, put, patch } = useForm<EventFormData>({
        title: defaultValues.title ?? '',
        description: defaultValues.description ?? '',
        category: defaultValues.category ?? '',
        type: defaultValues.type ?? 'offline',
        status: defaultValues.status ?? 'draft',
        location: defaultValues.location ?? '',
        maps_url: defaultValues.maps_url ?? '',
        online_platform: defaultValues.online_platform ?? '',
        online_url: defaultValues.online_url ?? '',
        starts_at: defaultValues.starts_at ?? '',
        ends_at: defaultValues.ends_at ?? '',
        max_attendees: defaultValues.max_attendees ?? '',
        banner: null,
        agendas: (defaultValues.agendas ?? []) as AgendaItem[],
        speakers: (defaultValues.speakers ?? []) as SpeakerItem[],
        sponsors: (defaultValues.sponsors ?? []) as SponsorItem[],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: true,
        };

        if (method === 'post') post(action, options);
        else if (method === 'put') put(action, options);
        else patch(action, options);
    }

    // --- Agenda helpers ---
    const addAgenda = () =>
        setData('agendas', [...data.agendas, { time: '', title: '', description: '', speaker: '' }]);

    const updateAgenda = (idx: number, key: keyof AgendaItem, value: string) => {
        const updated = data.agendas.map((a, i) => (i === idx ? { ...a, [key]: value } : a));
        setData('agendas', updated);
    };

    const removeAgenda = (idx: number) =>
        setData('agendas', data.agendas.filter((_, i) => i !== idx));

    // --- Speaker helpers ---
    const addSpeaker = () =>
        setData('speakers', [...data.speakers, { name: '', title: '', bio: '', avatar: null }]);

    const updateSpeaker = (idx: number, key: keyof SpeakerItem, value: string | File) => {
        const updated = data.speakers.map((s, i) => {
            if (i !== idx) return s;
            if (key === 'avatar' && value instanceof File) {
                return { ...s, avatar: value, avatarPreview: URL.createObjectURL(value) };
            }
            return { ...s, [key]: value };
        });
        setData('speakers', updated);
    };

    const removeSpeaker = (idx: number) =>
        setData('speakers', data.speakers.filter((_, i) => i !== idx));

    // --- Sponsor helpers ---
    const addSponsor = () =>
        setData('sponsors', [...data.sponsors, { name: '', website: '', tier: 'bronze', logo: null }]);

    const updateSponsor = (idx: number, key: keyof SponsorItem, value: string | File) => {
        const updated = data.sponsors.map((s, i) => {
            if (i !== idx) return s;
            if (key === 'logo' && value instanceof File) {
                return { ...s, logo: value, logoPreview: URL.createObjectURL(value) };
            }
            return { ...s, [key]: value };
        });
        setData('sponsors', updated);
    };

    const removeSponsor = (idx: number) =>
        setData('sponsors', data.sponsors.filter((_, i) => i !== idx));

    const showOffline = data.type === 'offline' || data.type === 'hybrid';
    const showOnline = data.type === 'online' || data.type === 'hybrid';

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Step navigator */}
            <div className="flex gap-1 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => setCurrentStep(idx)}
                            className={cn(
                                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                                currentStep === idx
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {step.label}
                        </button>
                    );
                })}
            </div>

            {/* Step: Info Dasar */}
            {currentStep === 0 && (
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Judul Event <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Nama event Anda"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <RichTextEditor
                            value={data.description}
                            onChange={(val) => setData('description', val)}
                            placeholder="Ceritakan detail tentang event Anda..."
                            minHeight="200px"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipe Event <span className="text-destructive">*</span></Label>
                            <Select value={data.type} onValueChange={(v) => setData('type', v as typeof data.type)}>
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offline">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" /> Offline
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="online">
                                        <div className="flex items-center gap-2">
                                            <MonitorPlay className="h-4 w-4" /> Online
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="hybrid">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> Hybrid
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="banner">Banner Event</Label>
                        {bannerPreview && (
                            <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className="h-48 w-full rounded-lg object-cover border"
                            />
                        )}
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="banner"
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <Image className="h-4 w-4" />
                                {bannerPreview ? 'Ganti banner' : 'Upload banner (max 4MB)'}
                            </label>
                        </div>
                        <input
                            id="banner"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setData('banner', file);
                                if (file) setBannerPreview(URL.createObjectURL(file));
                            }}
                        />
                        <InputError message={errors.banner} />
                    </div>
                </div>
            )}

            {/* Step: Lokasi */}
            {currentStep === 1 && (
                <div className="space-y-5">
                    {showOffline && (
                        <div className="space-y-4 rounded-xl border p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <MapPin className="h-4 w-4" />
                                Lokasi Fisik
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Alamat Lengkap</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Jl. Sudirman No. 1, Jakarta Pusat"
                                />
                                <InputError message={errors.location} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maps_url">Google Maps URL</Label>
                                <Input
                                    id="maps_url"
                                    value={data.maps_url}
                                    onChange={(e) => setData('maps_url', e.target.value)}
                                    placeholder="https://maps.google.com/?q=..."
                                />
                                <InputError message={errors.maps_url} />
                                {data.maps_url && (
                                    <a
                                        href={data.maps_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-primary underline"
                                    >
                                        Preview di Google Maps ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {showOnline && (
                        <div className="space-y-4 rounded-xl border p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <MonitorPlay className="h-4 w-4" />
                                Platform Online
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="online_platform">Platform Streaming</Label>
                                <Select
                                    value={data.online_platform}
                                    onValueChange={(v) => setData('online_platform', v)}
                                >
                                    <SelectTrigger id="online_platform">
                                        <SelectValue placeholder="Pilih platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLATFORMS.map((p) => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.online_platform} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="online_url">
                                    Link Streaming <span className="text-xs text-muted-foreground">(hanya ditampilkan ke peserta terdaftar)</span>
                                </Label>
                                <Input
                                    id="online_url"
                                    value={data.online_url}
                                    onChange={(e) => setData('online_url', e.target.value)}
                                    placeholder="https://zoom.us/j/1234567890"
                                    type="url"
                                />
                                <InputError message={errors.online_url} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step: Agenda & Speakers */}
            {currentStep === 2 && (
                <div className="space-y-8">
                    {/* Agenda */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Agenda / Rundown</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addAgenda}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Sesi
                            </Button>
                        </div>

                        {data.agendas.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                                Belum ada agenda. Tambahkan sesi untuk rundown event Anda.
                            </p>
                        )}

                        {data.agendas.map((agenda, idx) => (
                            <div key={idx} className="rounded-xl border p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        Sesi {idx + 1}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => removeAgenda(idx)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Waktu</Label>
                                        <Input
                                            type="time"
                                            value={agenda.time}
                                            onChange={(e) => updateAgenda(idx, 'time', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Pembicara</Label>
                                        <Input
                                            value={agenda.speaker}
                                            onChange={(e) => updateAgenda(idx, 'speaker', e.target.value)}
                                            placeholder="Nama pembicara"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Judul Sesi <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={agenda.title}
                                        onChange={(e) => updateAgenda(idx, 'title', e.target.value)}
                                        placeholder="Judul materi atau kegiatan"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Deskripsi Sesi</Label>
                                    <RichTextEditor
                                        value={agenda.description}
                                        onChange={(val) => updateAgenda(idx, 'description', val)}
                                        placeholder="Detail tentang sesi ini..."
                                        minHeight="100px"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Speakers */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Pembicara (Speakers)</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Pembicara
                            </Button>
                        </div>

                        {data.speakers.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                                Belum ada pembicara. Tambahkan profil pembicara event Anda.
                            </p>
                        )}

                        {data.speakers.map((speaker, idx) => (
                            <div key={idx} className="rounded-xl border p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        {(speaker.avatarPreview || (typeof speaker.avatar === 'string' && speaker.avatar)) ? (
                                            <img
                                                src={speaker.avatarPreview ?? `/storage/${speaker.avatar}`}
                                                alt={speaker.name}
                                                className="h-12 w-12 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-muted border flex items-center justify-center">
                                                <Users className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <p className="text-sm font-medium">Pembicara {idx + 1}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => removeSpeaker(idx)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Nama <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={speaker.name}
                                            onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                                            placeholder="Nama lengkap"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Jabatan / Posisi</Label>
                                        <Input
                                            value={speaker.title}
                                            onChange={(e) => updateSpeaker(idx, 'title', e.target.value)}
                                            placeholder="CEO, Developer, dll"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Bio Singkat</Label>
                                    <Input
                                        value={speaker.bio}
                                        onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)}
                                        placeholder="Deskripsi singkat pembicara"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Foto Pembicara</Label>
                                    <label className="flex cursor-pointer items-center gap-2 w-fit rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                                        <Image className="h-3.5 w-3.5" />
                                        Upload foto
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) updateSpeaker(idx, 'avatar', file);
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step: Sponsor */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Sponsor</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSponsor}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Sponsor
                        </Button>
                    </div>

                    {data.sponsors.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                            Belum ada sponsor. Tambahkan sponsor untuk event Anda.
                        </p>
                    )}

                    {data.sponsors.map((sponsor, idx) => (
                        <div key={idx} className="rounded-xl border p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    {(sponsor.logoPreview || (typeof sponsor.logo === 'string' && sponsor.logo)) ? (
                                        <img
                                            src={sponsor.logoPreview ?? `/storage/${sponsor.logo}`}
                                            alt={sponsor.name}
                                            className="h-10 w-20 rounded object-contain border bg-white p-1"
                                        />
                                    ) : (
                                        <div className="h-10 w-20 rounded bg-muted border flex items-center justify-center">
                                            <Image className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <p className="text-sm font-medium">Sponsor {idx + 1}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => removeSponsor(idx)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Nama Sponsor <span className="text-destructive">*</span></Label>
                                    <Input
                                        value={sponsor.name}
                                        onChange={(e) => updateSponsor(idx, 'name', e.target.value)}
                                        placeholder="Nama perusahaan"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Tier</Label>
                                    <Select
                                        value={sponsor.tier}
                                        onValueChange={(v) => updateSponsor(idx, 'tier', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gold">🥇 Gold</SelectItem>
                                            <SelectItem value="silver">🥈 Silver</SelectItem>
                                            <SelectItem value="bronze">🥉 Bronze</SelectItem>
                                            <SelectItem value="media">📰 Media Partner</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs">Website</Label>
                                <Input
                                    value={sponsor.website}
                                    onChange={(e) => updateSponsor(idx, 'website', e.target.value)}
                                    placeholder="https://sponsor.com"
                                    type="url"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label className="text-xs">Logo Sponsor</Label>
                                <label className="flex cursor-pointer items-center gap-2 w-fit rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                                    <Image className="h-3.5 w-3.5" />
                                    Upload logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) updateSponsor(idx, 'logo', file);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Step: Publikasi */}
            {currentStep === 4 && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="starts_at">Tanggal & Waktu Mulai</Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) => setData('starts_at', e.target.value)}
                            />
                            <InputError message={errors.starts_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ends_at">Tanggal & Waktu Selesai</Label>
                            <Input
                                id="ends_at"
                                type="datetime-local"
                                value={data.ends_at}
                                onChange={(e) => setData('ends_at', e.target.value)}
                                min={data.starts_at}
                            />
                            <InputError message={errors.ends_at} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="max_attendees">Kapasitas Peserta</Label>
                        <Input
                            id="max_attendees"
                            type="number"
                            min={1}
                            value={data.max_attendees}
                            onChange={(e) => setData('max_attendees', e.target.value)}
                            placeholder="Kosongkan jika tidak ada batas"
                        />
                        <InputError message={errors.max_attendees} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status Publikasi</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v as typeof data.status)}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                        Draft — hanya Anda yang bisa melihat
                                    </div>
                                </SelectItem>
                                <SelectItem value="published">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        Published — tampil ke publik
                                    </div>
                                </SelectItem>
                                {defaultValues.status === 'cancelled' && (
                                    <SelectItem value="cancelled">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-destructive" />
                                            Cancelled
                                        </div>
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                </div>
            )}

            {/* Footer navigation */}
            <div className="flex items-center justify-between border-t pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                    disabled={currentStep === 0}
                >
                    ← Sebelumnya
                </Button>

                <div className="flex items-center gap-2">
                    {STEPS.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentStep(idx)}
                            className={cn(
                                'h-2 w-2 rounded-full transition-all',
                                idx === currentStep ? 'bg-primary w-4' : 'bg-muted-foreground/30',
                            )}
                        />
                    ))}
                </div>

                {currentStep < STEPS.length - 1 ? (
                    <Button
                        type="button"
                        onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    >
                        Selanjutnya →
                    </Button>
                ) : (
                    <Button type="submit" disabled={processing}>
                        <Ticket className="mr-2 h-4 w-4" />
                        {processing ? 'Menyimpan...' : submitLabel}
                    </Button>
                )}
            </div>
        </form>
    );
}
