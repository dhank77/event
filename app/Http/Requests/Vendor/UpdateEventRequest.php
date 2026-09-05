<?php

namespace App\Http\Requests\Vendor;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;

class UpdateEventRequest extends FormRequest
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
            'status' => ['required', 'in:draft,published,cancelled'],
            'banner' => $this->imageOrStringRule(4096, 'banner'),
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
            'agendas.*.id' => ['nullable', 'integer'],
            'agendas.*.time' => ['nullable', 'date_format:H:i,H:i:s'],
            'agendas.*.title' => ['required_with:agendas', 'string', 'max:255'],
            'agendas.*.description' => ['nullable', 'string'],
            'agendas.*.speaker' => ['nullable', 'string', 'max:255'],

            // Speakers
            'speakers' => ['nullable', 'array'],
            'speakers.*.id' => ['nullable', 'integer'],
            'speakers.*.name' => ['required_with:speakers', 'string', 'max:255'],
            'speakers.*.title' => ['nullable', 'string', 'max:255'],
            'speakers.*.bio' => ['nullable', 'string'],
            'speakers.*.avatar' => $this->imageOrStringRule(2048, 'avatar'),

            // Sponsors
            'sponsors' => ['nullable', 'array'],
            'sponsors.*.id' => ['nullable', 'integer'],
            'sponsors.*.name' => ['required_with:sponsors', 'string', 'max:255'],
            'sponsors.*.logo' => $this->imageOrStringRule(2048, 'logo'),
            'sponsors.*.website' => ['nullable', 'url', 'max:500'],
            'sponsors.*.tier' => ['nullable', 'in:gold,silver,bronze,media'],
        ];
    }

    /**
     * @return array<int, mixed>
     */
    private function imageOrStringRule(int $maxKilobytes, string $label): array
    {
        return [
            'nullable',
            function (string $attribute, mixed $value, Closure $fail) use ($maxKilobytes, $label): void {
                if ($value instanceof UploadedFile) {
                    $validator = Validator::make(
                        [$attribute => $value],
                        [$attribute => ['image', "max:{$maxKilobytes}"]]
                    );

                    if ($validator->fails()) {
                        $fail($validator->errors()->first($attribute));
                    }
                } elseif (! is_string($value)) {
                    $fail("File {$label} harus berupa gambar.");
                }
            },
        ];
    }
}
