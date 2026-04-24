import { FontCatalog } from "@/components/font-catalog";
import catalog from "@/lib/fonts.json";

export default function HomePage() {
  return <FontCatalog catalog={catalog} />;
}
