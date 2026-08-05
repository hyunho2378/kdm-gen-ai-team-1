import { useApp } from '../context/AppContext'
import { typography } from '../tokens/tokens'

export function useTypography() {
  const { isLargeText } = useApp()
  return isLargeText ? typography.sizeLarge : typography.size
}
