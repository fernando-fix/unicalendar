import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, TrashIcon } from 'lucide-react';

export type DateSlot = {
    start_at: string;
    end_at: string;
};

type EventDatesFieldProps = {
    data: {
        start_at: string;
        end_at: string;
        dates: DateSlot[];
    };
    setData: (key: string, value: unknown) => void;
    errors: Partial<Record<string, string>>;
    onMultipleChange?: (multiple: boolean) => void;
};

export default function EventDatesField({ data, setData, errors, onMultipleChange }: EventDatesFieldProps) {
    const [multipleDates, setMultipleDates] = useState(false);

    function addDateSlot() {
        const last = data.dates[data.dates.length - 1];
        setData('dates', [...data.dates, { start_at: last?.start_at || '', end_at: last?.end_at || '' }]);
    }

    function removeDateSlot(index: number) {
        if (data.dates.length <= 1) return;
        setData('dates', data.dates.filter((_, i) => i !== index));
    }

    function updateDateSlot(index: number, field: keyof DateSlot, value: string) {
        const newDates = data.dates.map((d, i) =>
            i === index ? { ...d, [field]: value } : d
        );
        setData('dates', newDates);
    }

    function toggleMultipleDates() {
        if (!multipleDates) {
            setData('dates', [{ start_at: data.start_at || '', end_at: data.end_at || '' }]);
        }
        setMultipleDates(!multipleDates);
        onMultipleChange?.(!multipleDates);
    }

    function getDateError(index: number, field: keyof DateSlot): string | null {
        const key = `dates.${index}.${field}`;
        return errors[key] || null;
    }

    return (
        <div className="space-y-6">
            {multipleDates ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Datas</Label>
                        <span className="text-sm text-muted-foreground">
                            {data.dates.length} {data.dates.length === 1 ? 'data' : 'datas'}
                        </span>
                    </div>

                    {data.dates.map((dateSlot, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-3">
                            <div className="flex-1 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`start_at-${index}`}>Início</Label>
                                    <Input
                                        id={`start_at-${index}`}
                                        type="datetime-local"
                                        value={dateSlot.start_at}
                                        onChange={(e) => updateDateSlot(index, 'start_at', e.target.value)}
                                    />
                                    {getDateError(index, 'start_at') && (
                                        <p className="text-sm text-destructive">{getDateError(index, 'start_at')}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`end_at-${index}`}>Término</Label>
                                    <Input
                                        id={`end_at-${index}`}
                                        type="datetime-local"
                                        value={dateSlot.end_at}
                                        onChange={(e) => updateDateSlot(index, 'end_at', e.target.value)}
                                    />
                                    {getDateError(index, 'end_at') && (
                                        <p className="text-sm text-destructive">{getDateError(index, 'end_at')}</p>
                                    )}
                                </div>
                            </div>
                            {data.dates.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDateSlot(index)}
                                    className="mt-6 text-destructive hover:text-destructive"
                                >
                                    <TrashIcon className="size-4" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addDateSlot} className="w-full">
                        <PlusIcon className="size-4 mr-2" />
                        Adicionar Data
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="start_at">Data e hora de início</Label>
                        <Input
                            id="start_at"
                            type="datetime-local"
                            value={data.start_at}
                            onChange={(e) => setData('start_at', e.target.value)}
                        />
                        {errors.start_at && (
                            <p className="text-sm text-destructive">{errors.start_at}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_at">Data e hora de término</Label>
                        <Input
                            id="end_at"
                            type="datetime-local"
                            value={data.end_at}
                            onChange={(e) => setData('end_at', e.target.value)}
                        />
                        {errors.end_at && (
                            <p className="text-sm text-destructive">{errors.end_at}</p>
                        )}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={toggleMultipleDates}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
                {multipleDates ? 'Criar em uma data apenas' : 'Criar em várias datas'}
            </button>
        </div>
    );
}
