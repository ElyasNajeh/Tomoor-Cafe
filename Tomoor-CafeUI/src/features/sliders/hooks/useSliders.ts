import { useCallback, useEffect, useMemo, useState } from "react"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderPayload } from "../sliders.types"

const PAGE_SIZE = 10

export function useSliders() {
  const { toast, confirm } = useFeedback()
  const [allItems, setAllItems] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearchValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const loadSliders = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const result = await SlidersApi.list()
      setAllItems([...result].sort((first, second) => first.display_order - second.display_order))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load sliders")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Synchronize the slider collection with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSliders()
  }, [loadSliders])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()

    return allItems.filter((slider) => {
      const matchesSearch = !term
        || slider.title_en.toLocaleLowerCase().includes(term)
        || slider.title_ar.toLocaleLowerCase().includes(term)
      const matchesStatus = !statusFilter
        || slider.is_active === (statusFilter === "true")

      return matchesSearch && matchesStatus
    })
  }, [allItems, search, statusFilter])

  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const items = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  async function saveSlider(
    slider: Slider | null,
    payload: SliderPayload,
    isActive: boolean,
  ) {
    const savedSlider = slider
      ? await SlidersApi.update(slider.id, payload)
      : await SlidersApi.create(payload)

    if (savedSlider.is_active !== isActive) {
      await SlidersApi.toggle(savedSlider.id)
    }

    toast.success(
      slider ? "Slider updated" : "Slider created",
      `${payload.title_en} was saved successfully.`,
    )
    await loadSliders()
  }

  async function deleteSlider(slider: Slider) {
    const confirmed = await confirm({
      title: "Delete slider?",
      message: `Permanently delete ${slider.title_en}? This cannot be undone.`,
      confirmLabel: "Delete slider",
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await SlidersApi.delete(slider.id)
      toast.success("Slider deleted", `${slider.title_en} was removed.`)
      await loadSliders()
    } catch (caught) {
      toast.error("Could not delete slider", caught instanceof Error ? caught.message : undefined)
    }
  }

  async function toggleSlider(slider: Slider) {
    try {
      await SlidersApi.toggle(slider.id)
      toast.success(
        slider.is_active ? "Slider hidden" : "Slider activated",
        `${slider.title_en} is now ${slider.is_active ? "hidden from" : "visible on"} the home page.`,
      )
      await loadSliders()
    } catch (caught) {
      toast.error("Status update failed", caught instanceof Error ? caught.message : undefined)
    }
  }

  return {
    items,
    loading,
    error,
    search,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setStatusFilter: (value: string) => updateFilter(setStatusFilterValue, value),
    setPage,
    reload: loadSliders,
    saveSlider,
    deleteSlider,
    toggleSlider,
  }
}
