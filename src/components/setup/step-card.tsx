interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function StepCard({ number, title, description, children }: StepCardProps) {
  return (
    <div className="relative pl-12 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 last:hidden" />

      {/* Step number circle */}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-medium">
        {number}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
