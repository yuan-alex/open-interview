import { Button, Dialog, Select, TextField } from "@radix-ui/themes";

const themes = ["vs-light", "vs-dark"];

interface IProps {
  theme?: string;
  onThemeChange?: (value: string) => void;
  editorFontSize?: number;
  onEditorFontSizeChange?: (value: string) => void;
}

export function SettingsDialog(props: IProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Settings</Button>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Settings</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Changes to your editor settings only apply to your session.
        </Dialog.Description>
        <p className="text-sm font-medium mb-1 mt-6">Theme</p>
        <Select.Root value={props.theme} onValueChange={props.onThemeChange}>
          <Select.Trigger />
          <Select.Content>
            {themes.map((theme) => (
              <Select.Item key={theme} value={theme}>
                {theme}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <p className="text-sm font-medium mb-1 mt-6">Font size (px)</p>
        <TextField.Root
          type="number"
          placeholder="Type here"
          value={props.editorFontSize}
          onChange={(event) =>
            props?.onEditorFontSizeChange(event.target.value)
          }
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
