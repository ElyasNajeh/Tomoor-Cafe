import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderPayload } from "../sliders.types"

const PAGE_SIZE = 10

export function useSliders() {
  const { toast, confirm } = useFeedback()
  const queryClient = useQueryClient()
  const [search, setSearchValue] = useState("")
  const [statusFilter, setStatusFilterValue] = useState("")
  const [page, setPage] = useState(1)

  const slidersQuery = useQuery({
    queryKey: queryKeys.sliders,
    queryFn: SlidersApi.list,
    select: (sliders) => [...sliders].sort(
      (first, second) => first.display_order - second.display_order,
    ),
  })

  const saveMutation = useMutation({
    mutationFn: async ({
      slider,
      payload,
      isActive,
    }: {
      slider: Slider | null
      payload: SliderPayload
      isActive: boolean
    }) => {
      const savedSlider = slider
        ? await SlidersApi.update(slider.id, payload)
        : await SlidersApi.create(payload)

      if (savedSlider.is_active !== isActive) {
        return SlidersApi.toggle(savedSlider.id)
      }

      return savedSlider
    },
    onSuccess: async (_, { slider, payload }) => {
      toast.success(
        slider ? "Slider updated" : "Slider created",
        `${payload.title_en} was saved successfully.`,
      )

      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.sliders }),
      ]

      if (!slider) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
        )
      }

      await Promise.all(invalidations)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (slider: Slider) => SlidersApi.delete(slider.id),
    onSuccess: async (_, slider) => {
      toast.success("Slider deleted", `${slider.title_en} was removed.`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.sliders }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
      ])
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (slider: Slider) => SlidersApi.toggle(slider.id),
    onSuccess: async (_, slider) => {
      toast.success(
        slider.is_active ? "Slider hidden" : "Slider activated",
        `${slider.title_en} is now ${slider.is_active ? "hidden from" : "visible on"} the home page.`,
      )
      await queryClient.invalidateQueries({ queryKey: queryKeys.sliders })
    },
  })

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()

    return (slidersQuery.data ?? []).filter((slider) => {
      const matchesSearch = !term
        || slider.title_en.toLocaleLowerCase().includes(term)
        || slider.title_ar.toLocaleLowerCase().includes(term)
      const matchesStatus = !statusFilter
        || slider.is_active === (statusFilter === "true")

      return matchesSearch && matchesStatus
    })
  }, [slidersQuery.data, search, statusFilter])

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
    await saveMutation.mutateAsync({ slider, payload, isActive })
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
      await deleteMutation.mutateAsync(slider)
    } catch (caught) {
      toast.error("Could not delete slider", caught instanceof Error ? caught.message : undefined)
    }
  }

  async function toggleSlider(slider: Slider) {
    try {
      await toggleMutation.mutateAsync(slider)
    } catch (caught) {
      toast.error("Status update failed", caught instanceof Error ? caught.message : undefined)
    }
  }

  const error = slidersQuery.error instanceof Error
    ? slidersQuery.error.message
    : slidersQuery.error
      ? "Unable to load sliders"
      : ""

  return {
    items,
    loading: slidersQuery.isPending,
    error,
    search,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setStatusFilter: (value: string) => updateFilter(setStatusFilterValue, value),
    setPage,
    reload: slidersQuery.refetch,
    saveSlider,
    deleteSlider,
    toggleSlider,
  }
}
