import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';

interface ConfigFieldInputProps {
  field: {
    key: string;
    label: string;
    value: string;
    locked: boolean;
    multiline?: boolean;
    rows?: number;
  };
  onUpdate: (key: string, value: string) => void;
  onToggleLock: (key: string) => void;
  specialType?: 'tono';
}

export function ConfigFieldInput({
  field,
  onUpdate,
  onToggleLock,
  specialType
}: ConfigFieldInputProps) {
  if (specialType === 'tono') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{field.label}</Label>
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={field.locked}
              onCheckedChange={() => onToggleLock(field.key)}
            />
            <span className="text-sm text-gray-600">Revisado</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={field.value === 'Formal' ? 'default' : 'outline'}
            onClick={() => onUpdate(field.key, 'Formal')}
            disabled={field.locked}
            className={field.value === 'Formal' ? 'bg-purple-600' : ''}
          >
            Formal
          </Button>
          <Button 
            variant={field.value === 'Informal' ? 'default' : 'outline'}
            onClick={() => onUpdate(field.key, 'Informal')}
            disabled={field.locked}
            className={field.value === 'Informal' ? 'bg-purple-600' : ''}
          >
            Informal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{field.label}</Label>
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={field.locked}
            onCheckedChange={() => onToggleLock(field.key)}
          />
          <span className="text-sm text-gray-600">Revisado</span>
        </div>
      </div>
      {field.multiline ? (
        <Textarea
          value={field.value}
          onChange={(e) => onUpdate(field.key, e.target.value)}
          disabled={field.locked}
          rows={field.rows || 4}
          className={field.locked ? 'bg-gray-50' : 'bg-white'}
        />
      ) : (
        <Input 
          value={field.value}
          onChange={(e) => onUpdate(field.key, e.target.value)}
          disabled={field.locked}
          className={field.locked ? 'bg-gray-50' : 'bg-white'}
        />
      )}
    </div>
  );
}

