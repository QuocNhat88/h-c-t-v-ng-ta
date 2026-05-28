import { DictionaryEntryModel } from "./dictionary.model.js";

const builtin = new Map(
  [
    ["hello", ["xin chào", "chào bạn", "lời chào"]],
    ["hi", ["xin chào", "chào"]],
    ["goodbye", ["tạm biệt"]],
    ["thank you", ["cảm ơn"]],
    ["thanks", ["cảm ơn"]],
    ["sorry", ["xin lỗi"]],
    ["book", ["quyển sách", "sách"]],
    ["study", ["học tập", "nghiên cứu"]],
    ["learn", ["học", "học hỏi"]],
    ["school", ["trường học"]],
    ["teacher", ["giáo viên"]],
    ["student", ["học sinh", "sinh viên"]],
    ["friend", ["bạn bè", "người bạn"]],
    ["family", ["gia đình"]],
    ["love", ["yêu", "tình yêu"]],
    ["work", ["làm việc", "công việc"]],
    ["water", ["nước"]],
    ["food", ["thức ăn", "đồ ăn"]],
    ["house", ["ngôi nhà", "căn nhà"]],
    ["computer", ["máy tính"]],
    ["beverage", ["đồ uống", "thức uống"]],
    ["drink", ["đồ uống", "uống"]],
    ["coffee", ["cà phê"]],
    ["tea", ["trà"]],
    ["milk", ["sữa"]],
    ["apple", ["quả táo"]],
    ["banana", ["quả chuối"]],
    ["beautiful", ["đẹp", "xinh đẹp"]],
    ["important", ["quan trọng"]],
    ["quick", ["nhanh"]],
    ["slow", ["chậm"]],
    ["happy", ["vui vẻ", "hạnh phúc"]],
    ["sad", ["buồn"]],
    ["buy", ["mua"]],
    ["sell", ["ban"]],
    ["open", ["mở"]],
    ["close", ["đóng"]],
    ["listen", ["lắng nghe"]],
    ["speak", ["nói"]],
    ["write", ["viết"]],
    ["read", ["đọc"]]
  ].map(([term, suggestions]) => [term, suggestions])
);

function normalize(term) {
  return term.trim().toLowerCase();
}

function fallbackSuggest(term) {
  const normalized = normalize(term);
  if (builtin.has(normalized)) return builtin.get(normalized);

  const partial = [...builtin.entries()]
    .filter(([key]) => key.startsWith(normalized))
    .slice(0, 5)
    .flatMap(([, suggestions]) => suggestions);

  return [...new Set(partial)];
}

function languageCode(locale) {
  return locale.split("-")[0].toLowerCase();
}

function sanitizeSuggestions(items) {
  return [...new Set(items.map((item) => item?.trim()).filter(Boolean))]
    .filter((item) => !/^matches$/i.test(item))
    .slice(0, 5);
}

async function translateOnline(term, from, to) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", term);
  url.searchParams.set("langpair", `${languageCode(from)}|${languageCode(to)}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "CloneQL/0.1"
    }
  });

  if (!response.ok) return [];

  const payload = await response.json();
  const direct = payload.responseData?.translatedText;
  const matches = Array.isArray(payload.matches)
    ? payload.matches.map((match) => match.translation)
    : [];

  return sanitizeSuggestions([direct, ...matches]);
}

export async function suggest({ term, from = "en-US", to = "vi-VN" }) {
  const normalized = normalize(term);
  if (!normalized) return { term, suggestions: [] };

  const localSuggestions = fallbackSuggest(normalized);
  if (localSuggestions.length) {
    const entry = await DictionaryEntryModel.findOneAndUpdate(
      { term: normalized, from, to },
      {
        term: normalized,
        from,
        to,
        suggestions: localSuggestions,
        examples: [`${term[0]?.toUpperCase() || ""}${term.slice(1)}.`]
      },
      { new: true, upsert: true }
    );
    return entry.toJSON();
  }

  const cached = await DictionaryEntryModel.findOne({ term: normalized, from, to });
  if (cached) return cached.toJSON();

  let suggestions = [];
  try {
    suggestions = await translateOnline(normalized, from, to);
  } catch {
    suggestions = [];
  }

  if (!suggestions.length) {
    return {
      term: normalized,
      from,
      to,
      suggestions: [],
      phonetic: "",
      partOfSpeech: "",
      examples: []
    };
  }

  const entry = await DictionaryEntryModel.findOneAndUpdate(
    { term: normalized, from, to },
    {
      term: normalized,
      from,
      to,
      suggestions,
      examples: [`${term[0]?.toUpperCase() || ""}${term.slice(1)}.`]
    },
    { new: true, upsert: true }
  );

  return entry.toJSON();
}
