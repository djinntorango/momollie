import { useParams, Navigate } from 'react-router-dom'
import BeeswaxBreadStorageBenefits from './blog/BeeswaxBreadStorageBenefits'
import HomeBakerySkills from './blog/HomeBakerySkills'
import SustainableKitchenSolutions from './blog/SustainableKitchenSolutions'
import HandmadeKitchenAccessories from './blog/HandmadeKitchenAccessories'
import HowToStoreSourdough from './blog/HowToStoreSourdough'
import BreadStorageMethods from './blog/BreadStorageMethods'
import PlasticFreeKitchenSwaps from './blog/PlasticFreeKitchenSwaps'
import CaringForBeeswaxBags from './blog/CaringForBeeswaxBags'

const blogComponents: Record<string, React.ComponentType> = {
  'beeswax-bread-storage-benefits': BeeswaxBreadStorageBenefits,
  'home-bakery-skills': HomeBakerySkills,
  'sustainable-kitchen-solutions': SustainableKitchenSolutions,
  'handmade-kitchen-accessories': HandmadeKitchenAccessories,
  'how-to-store-sourdough-bread': HowToStoreSourdough,
  'bread-storage-methods-compared': BreadStorageMethods,
  'plastic-free-kitchen-swaps': PlasticFreeKitchenSwaps,
  'caring-for-beeswax-bread-bags': CaringForBeeswaxBags,
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const Component = slug ? blogComponents[slug] : undefined

  if (!Component) {
    return <Navigate to="/blog" replace />
  }

  return <Component />
}
