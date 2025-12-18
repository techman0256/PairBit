import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { rust } from "@codemirror/lang-rust";

const languageExtensions: Record<string, any> = {
  javascript,
  java,
  python,
  cpp,
  html,
  json,
  markdown,
  go,
  rust,
};

export const languageOptions = [
  { label: "JavaScript", value: "javascript" },
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "HTML", value: "html" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" }
];
  // Helper to get the language extension
export const getLanguageExtension = (language: string) => {
  return languageExtensions[language] ? languageExtensions[language]() : javascript();
};

export const usercolors = [
  { color: '#30bced', light: '#30bced33' },
  { color: '#6eeb83', light: '#6eeb8333' },
  { color: '#ffbc42', light: '#ffbc4233' },
  { color: '#ecd444', light: '#ecd44433' },
  { color: '#ee6352', light: '#ee635233' },
  { color: '#9ac2c9', light: '#9ac2c933' },
  { color: '#8acb88', light: '#8acb8833' },
  { color: '#1be7ff', light: '#1be7ff33' }
]

