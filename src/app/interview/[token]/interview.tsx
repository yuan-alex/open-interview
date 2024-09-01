"use client";

import { useCallback, useEffect, useState } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { type YSweetProvider, createYjsProvider } from "@y-sweet/client";
import { Editor } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import {
  Card,
  Code,
  Dialog,
  Select,
  TextField,
  Button,
  Badge,
} from "@radix-ui/themes";
import { RxCode, RxGithubLogo } from "react-icons/rx";

import { runCode } from "../../../app/actions";
import { supportedLanguages } from "../../../utils/languages";

const themes = ["vs-light", "vs-dark"];

interface InterviewProps {
  authToken: string;
  ySweetAuth: any;
}

export default function Interview(props: InterviewProps) {
  const [editorLanguage, setEditorLanguage] = useState(
    supportedLanguages.find((lang) => lang.id === 63),
  );
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [editorTheme, setEditorTheme] = useState(themes[1]);

  const [codeResultHistory, setCodeResultHistory] = useState([]);

  const [provider, setProvider] = useState<YSweetProvider>();
  const [yCodeSubmissions, setYCodeSubmissions] = useState<Y.Array<any>>();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();

  const handleSubmitCode = useCallback(async () => {
    const result = await runCode(
      props.authToken,
      editorLanguage!!.id,
      editorRef?.getModel()?.getValue() || "",
    );
    yCodeSubmissions.insert(0, [result]);
  }, [editorRef, editorLanguage, props.authToken, yCodeSubmissions]);

  const handleOnMount = useCallback((e: editor.IStandaloneCodeEditor) => {
    setEditorRef(e);
  }, []);

  useEffect(() => {
    let yProvider: any;
    let yDoc: Y.Doc;
    let binding: MonacoBinding;

    if (editorRef) {
      yDoc = new Y.Doc();
      const yText = yDoc.getText("editor");
      const yProvider = createYjsProvider(yDoc, props.ySweetAuth);
      setProvider(yProvider);

      binding = new MonacoBinding(
        yText,
        editorRef.getModel() as editor.ITextModel,
        new Set([editorRef]),
        yProvider.awareness,
      );

      const yArr = yDoc.getArray("code_submissions");
      setYCodeSubmissions(yArr);

      yArr.observe((event) => {
        for (const item of Array.from(event.changes.added)) {
          setCodeResultHistory((prev) => [item.content.arr[0], ...prev]);
        }
      });
    }

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
      binding?.destroy();
    };
  }, [editorRef, props]);

  return (
    <div className="h-screen flex">
      <div className="flex w-2/3 flex-grow flex-col">
        <nav className="p-2 flex items-center space-x-2">
          <RxCode />
          <p className="text-lg font-light">Open Interview</p>
          <span className="flex-grow" />
          <Select.Root
            value={editorLanguage.id}
            onValueChange={(value) =>
              setEditorLanguage(
                supportedLanguages.find((lang) => lang.id == value),
              )
            }
          >
            <Select.Trigger />
            <Select.Content>
              {supportedLanguages.map((l) => (
                <Select.Item key={l.id} value={l.id}>
                  {l.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
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
              <Select.Root
                value={editorTheme}
                onValueChange={(value) => setEditorTheme(value)}
              >
                <Select.Trigger />
                <Select.Content>
                  {themes.map((theme) => (
                    <Select.Item value={theme}>{theme}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <p className="text-sm font-medium mb-1 mt-6">Font size (px)</p>
              <TextField.Root
                type="number"
                placeholder="Type here"
                value={editorFontSize}
                onChange={(event) => setEditorFontSize(event.target.value)}
              />
            </Dialog.Content>
          </Dialog.Root>
        </nav>
        <div className="flex-grow">
          <Editor
            onMount={handleOnMount}
            height="100%"
            width="100hw"
            theme={editorTheme}
            language={editorLanguage.name}
            defaultValue=""
            options={{
              fontSize: editorFontSize,
            }}
          />
        </div>
      </div>
      <div className="w-1/3 flex-grow flex flex-col h-full">
        <div className="flex-grow overflow-y-scroll h-full">
          {codeResultHistory.length > 0 ? (
            <div className="p-3 flex flex-col space-y-3">
              {codeResultHistory.map((result) => (
                <Card key={result.id}>
                  <div className="mb-3">
                    <Badge color="gray">{result.languageLabel}</Badge>
                  </div>
                  <pre
                    className="p-3 text-sm rounded overflow-x-auto"
                    style={{
                      backgroundColor: "var(--gray-3)",
                    }}
                  >
                    {result.stdout ?? result.stderr ?? result.compileOutput}
                  </pre>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-10">
              <p className="mb-3 text-2xl font-semibold">Ready to start</p>
              <p>
                Click the run button to run the code in your editor. Everyone in
                the session will be able to see the output.
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2 p-3">
          <Button onClick={handleSubmitCode}>Run</Button>
        </div>
      </div>
    </div>
  );
}
