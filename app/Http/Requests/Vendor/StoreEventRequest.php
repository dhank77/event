<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'vendor';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['required', 'in:online,offline,hybrid'],
            'status' => ['required', 'in:draft,published'],
            'banner' => ['nullable', 'image', 'max:4096'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'max_attendees' => ['nullable', 'integer', 'min:1'],

            // Offline / Hybrid
            'location' => ['nullable', 'string', 'max:500'],
            'maps_url' => ['nullable', 'url', 'max:1000'],

            // Online / Hybrid
            'online_platform' => ['nullable', 'string', 'max:100'],
            'online_url' => ['nullable', 'url', 'max:1000'],

            // Agendas
            'agendas' => ['nullable', 'array'],
            'agendas.*.time' => ['nullable', 'date_format:H:i'],
            'agendas.*.title' => ['required_with:agendas', 'string', 'max:255'],
            'agendas.*.description' => ['nullable', 'string'],
            'agendas.*.speaker' => ['nullable', 'string', 'max:255'],

            // Speakers
            'speakers' => ['nullable', 'array'],
            'speakers.*.name' => ['required_with:speakers', 'string', 'max:255'],
            'speakers.*.title' => ['nullable', 'string', 'max:255'],
            'speakers.*.bio' => ['nullable', 'string'],
            'speakers.*.avatar' => ['nullable', 'image', 'max:2048'],

            // Sponsors
            'sponsors' => ['nullable', 'array'],
            'sponsors.*.name' => ['required_with:sponsors', 'string', 'max:255'],
            'sponsors.*.logo' => ['nullable', 'image', 'max:2048'],
            'sponsors.*.website' => ['nullable', 'url', 'max:500'],
            'sponsors.*.tier' => ['nullable', 'in:gold,silver,bronze,media'],
        ];
    }
}
