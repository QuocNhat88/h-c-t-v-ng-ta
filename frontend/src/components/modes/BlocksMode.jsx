import { useState } from "react";
import { playTone } from "../../utils/audio.js";
import EmptyState from "./EmptyState.jsx";

export default function BlocksMode({ cards }) {
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);

  if (!cards.length) return <EmptyState />;

  function move(card, bucket) {
    setKnown((current) => current.filter((id) => id !== card.id));
    setLearning((current) => current.filter((id) => id !== card.id));
    if (bucket === "known") setKnown((current) => [...current, card.id]);
    if (bucket === "learning") setLearning((current) => [...current, card.id]);
    playTone(bucket === "known" ? "correct" : "tap");
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Khoi hop</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-cloud p-3">
          <p className="mb-3 font-bold">Can phan loai</p>
          <div className="space-y-2">
            {cards.map((card) => (
              <div key={card.id} className="rounded-lg bg-white p-3 shadow-sm">
                <p className="font-bold">{card.term}</p>
                <p className="text-sm text-slate-500">{card.definition}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => move(card, "learning")} className="rounded-lg border border-line px-3 py-1 text-sm font-semibold">
                    Dang hoc
                  </button>
                  <button onClick={() => move(card, "known")} className="rounded-lg bg-mint px-3 py-1 text-sm font-semibold text-white">
                    Da biet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Bucket title="Dang hoc" cards={cards.filter((card) => learning.includes(card.id))} />
        <Bucket title="Da biet" cards={cards.filter((card) => known.includes(card.id))} />
      </div>
    </section>
  );
}

function Bucket({ title, cards }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <p className="mb-3 font-bold">{title}</p>
      <div className="space-y-2">
        {cards.map((card) => (
          <div key={card.id} className="rounded-lg bg-cloud p-3 font-semibold">
            {card.term}
          </div>
        ))}
      </div>
    </div>
  );
}
