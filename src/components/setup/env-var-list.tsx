"use client";

import { CopyButton } from "./copy-button";

interface EnvVar {
  name: string;
  value: string;
  source: string;
}

interface EnvVarListProps {
  variables: EnvVar[];
  copyLabel?: string;
  copiedLabel?: string;
}

export function EnvVarList({ variables, copyLabel = "Copy", copiedLabel = "Copied!" }: EnvVarListProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900/50">
            <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Variable
            </th>
            <th className="px-4 py-3 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Value / Source
            </th>
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {variables.map((v) => (
            <tr key={v.name} className="bg-white dark:bg-neutral-950">
              <td className="px-4 py-3">
                <code className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
                  {v.name}
                </code>
              </td>
              <td className="px-4 py-3">
                {v.value ? (
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    {v.value}
                  </code>
                ) : (
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {v.source}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <CopyButton
                  text={v.name}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
