import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';

interface QuestionFieldProps {
  pregunta: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  revisado: boolean;
  onToggleRevisado: () => void;
  rows?: number;
}

export function QuestionField({
  pregunta,
  placeholder,
  value,
  onChange,
  revisado,
  onToggleRevisado,
  rows = 3
}: QuestionFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-gray-700">{pregunta}</Label>
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={revisado}
            onCheckedChange={onToggleRevisado}
          />
          <span className="text-sm text-gray-600">Revisado</span>
        </div>
      </div>
      <Textarea 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={revisado}
        className={revisado ? 'bg-gray-50' : 'bg-white'}
      />
    </div>
  );
}

