import type { LabelData } from "@/types/label";

export function createLabel(overrides?: Partial<Omit<LabelData, "id">>): LabelData {
  return {
    id: crypto.randomUUID(),
    title: "Nouvelle bougie",
    leftImage: "/images/rose.svg",
    rightImage: "/images/branch.svg",
    weight: 100,
    perfumePercent: 9,
    ingredients: "",
    labelWidth: 140,
    labelHeight: 95,
    labelX: 35,
    labelY: 101,
    ...overrides,
  };
}

export const defaultLabels: LabelData[] = [
  createLabel({
    title: "Aigue Marine",
    ingredients:
      "2-phenylethanol, citronellol, α-hexylcinnamaldehyde, linalool, 3,7-dimethylnona-1,6-dien-3-ol, 2H-Pyran-4-ol tetrahydro-4-methyl-2-(2-methylpropyl)-, (R)-p-mentha-1,8-diene, 3-p-cumenyl-2-methylpropionaldehyde, 3-(p-ethylphenyl)-2,2-dimethylpropionaldehyde, 3-(p-methoxyphenyl)-2-methylpropionaldehyde, 1-(2,6,6-trimethyl-3-cyclohexen-1-yl)-2-buten-1-one, 2,4-dimethylcyclohex-3-ene-1-carbaldehyde, geraniol, indole, diphenyl ether",
  }),
];

export const FIXED_CONTACT = {
  email: "les.bougies.disa.76@gmail.com",
  phone: "06.63.17.98.02",
  address: "3 Allée du petit clos 76400 FROBERVILLE",
};
