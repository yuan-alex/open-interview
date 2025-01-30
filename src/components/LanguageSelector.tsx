import { Select } from "@radix-ui/themes";

import { supportedLanguages } from "@/utils/languages";

export function LanguageSelector(props) {
  return (
    <Select.Root {...props}>
      <Select.Trigger />
      <Select.Content>
        {supportedLanguages.map((l) => (
          <Select.Item key={l.id} value={l.id.toString()}>
            {l.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
