import { useSiteData } from "../hooks/useSiteData"
import { ConnectSection } from "./components/ConnectSection"
import { LocationSection } from "./components/LocationSection"
import { MenuSection } from "./components/MenuSection"
import { StatsSection } from "./components/StatsSection"
import { StorySection } from "./components/StorySection"

export function HomePage() {
  const { sliders } = useSiteData()

  return (
    <>
      <MenuSection sliders={sliders} />
      <StorySection />
      <LocationSection />
      <StatsSection />
      <ConnectSection />
    </>
  )
}
