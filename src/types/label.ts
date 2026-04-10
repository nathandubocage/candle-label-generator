export interface LabelData {
  id: string;
  title: string;
  leftImage: string | null;
  rightImage: string | null;
  weight: number;
  perfumePercent: number;
  ingredients: string;
  labelWidth: number;
  labelHeight: number;
  labelX: number;
  labelY: number;
  rotation: 0 | 90 | 180 | 270;
}
