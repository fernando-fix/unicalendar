import { Label } from '@/components/ui/label';

export const CALENDAR_COLORS = [
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'cyan', bg: 'bg-cyan-500' },
    { name: 'orange', bg: 'bg-orange-500' },
    { name: 'indigo', bg: 'bg-indigo-500' },
];

type CalendarColorPickerProps = {
    value: string;
    onChange: (color: string) => void;
};

export default function CalendarColorPicker({ value, onChange }: CalendarColorPickerProps) {
    return (
        <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2">
                {CALENDAR_COLORS.map((color) => (
                    <button
                        key={color.name}
                        type="button"
                        onClick={() => onChange(color.name)}
                        className={`size-8 rounded-full ${color.bg} transition-all ${
                            value === color.name
                                ? 'outline outline-2 outline-offset-2 outline-foreground'
                                : 'outline outline-2 outline-offset-2 outline-transparent hover:outline-muted-foreground/50'
                        }`}
                        aria-label={color.name}
                    />
                ))}
            </div>
        </div>
    );
}
