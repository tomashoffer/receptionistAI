import { AccordionSection } from './AccordionSection';
import { QuestionField } from './QuestionField';

interface Question {
  pregunta: string;
  placeholder: string;
  defaultValue: string;
}

interface SectionWithQuestionsProps {
  sectionKey: string;
  title: string;
  questions: Question[];
  formData: Record<string, string>;
  revisadoData: Record<string, boolean>;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (fieldKey: string, value: string) => void;
  onToggleRevisado: (fieldKey: string) => void;
  borderColor?: string;
}

export function SectionWithQuestions({
  sectionKey,
  title,
  questions,
  formData,
  revisadoData,
  isExpanded,
  onToggle,
  onUpdate,
  onToggleRevisado,
  borderColor = 'border-l-green-500'
}: SectionWithQuestionsProps) {
  const completed = questions.filter((q, index) => {
    const fieldKey = `respuesta${index + 1}`;
    return revisadoData[fieldKey] === true;
  }).length;

  return (
    <AccordionSection
      id={sectionKey}
      title={title}
      isExpanded={isExpanded}
      onToggle={onToggle}
      borderColor={borderColor}
      completed={completed}
      total={questions.length}
    >
      <div className="space-y-6">
        {questions.map((question, index) => {
          const fieldKey = `respuesta${index + 1}`;
          return (
            <QuestionField
              key={index}
              pregunta={question.pregunta}
              placeholder={question.placeholder}
              value={formData[fieldKey] || ''}
              onChange={(value) => onUpdate(fieldKey, value)}
              revisado={revisadoData[fieldKey] || false}
              onToggleRevisado={() => onToggleRevisado(fieldKey)}
            />
          );
        })}
      </div>
    </AccordionSection>
  );
}

