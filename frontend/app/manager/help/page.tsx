"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Como criar um novo projecto?",
    answer:
      'Acede à página "Projectos" na barra lateral e clica no botão "Novo Projecto". Preenche o nome, descrição, datas e membros da equipa.',
  },
  {
    question: "Como adicionar tarefas a um projecto?",
    answer:
      'Abre o projecto desejado na lista de projectos e clica em "Nova Tarefa". Define o nome, responsável, prioridade e data limite.',
  },
  {
    question: "Como alterar o estado de uma tarefa?",
    answer:
      "Na vista de tarefas, podes arrastar a tarefa entre colunas (A fazer, Em progresso, Revisão, Concluído) ou usar o menu de estado.",
  },
  {
    question: "Como editar as informações de um projecto?",
    answer:
      'Abre o projecto e clica no botão "Editar Projecto" no canto superior direito do cartão do projecto. Podes alterar o nome, descrição, datas e membros.',
  },
  {
    question: "Como alterar o estado de um projecto?",
    answer:
      'Na página do projecto, clica no badge de estado (Activo, Pausado, Concluído) para abrir o selector e escolhe o novo estado.',
  },
  {
    question: "Como convidar um membro para a equipa?",
    answer:
      'Acede à página "Equipa" e usa a opção de convidar. O membro receberá um email com instruções para definir a senha.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        {question}
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/10 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white dark:bg-black/50 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Centro de Ajuda</h2>
        <p className="text-sm text-gray-400">Encontra respostas para as perguntas mais frequentes.</p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-black/50 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Perguntas frequentes</h3>
        {faqs.map((faq) => (
          <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      <div className="rounded-3xl bg-white dark:bg-black/50 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Suporte</h3>
        <p className="text-sm text-gray-400">
          Para assistência adicional, contacta a equipa de suporte em{" "}
          <span className="text-gray-700 dark:text-gray-300 font-medium">suporte@cybercore.co.mz</span>.
        </p>
      </div>
    </div>
  );
}
