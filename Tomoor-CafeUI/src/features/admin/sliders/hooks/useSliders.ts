import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useFeedback } from "@/shared/feedback/FeedbackProvider"
import { queryKeys } from "@/shared/query/queryClient"
import { SlidersApi } from "../sliders.api"
import type { Slider, SliderPayload } from "../sliders.types"
import { useI18n } from "@/localization/useI18n"

const PAGE_SIZE = 10

export function useSliders() {
  const { toast, confirm } = useFeedback()
  const { t, language } = useI18n()
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
        t(slider ? "admin.feedback.slider.updated" : "admin.feedback.slider.created"),
        t("admin.feedback.slider.savedMessage", { name: language === "ar" ? payload.title_ar : payload.title_en }),
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
      toast.success(t("admin.feedback.slider.deleted"), t("admin.feedback.slider.deletedMessage", { name: language === "ar" ? slider.title_ar : slider.title_en }))
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
        t(slider.is_active ? "admin.feedback.slider.hidden" : "admin.feedback.slider.activated"),
        t(slider.is_active ? "admin.feedback.slider.hiddenMessage" : "admin.feedback.slider.activatedMessage", { name: language === "ar" ? slider.title_ar : slider.title_en }),
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
  const nextDisplayOrder = slidersQuery.data
    ? slidersQuery.data.reduce(
      (highestOrder, slider) => Math.max(highestOrder, slider.display_order),
      -1,
    ) + 1
    : null

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
      title: t("admin.feedback.slider.deleteTitle"),
      message: t("admin.feedback.slider.deleteMessage", { name: language === "ar" ? slider.title_ar : slider.title_en }),
      confirmLabel: t("admin.feedback.slider.deleteConfirm"),
      variant: "danger",
    })

    if (!confirmed) {
      return
    }

    try {
      await deleteMutation.mutateAsync(slider)
    } catch {
      toast.error(t("admin.feedback.slider.deleteError"), t("admin.feedback.requestFailed"))
    }
  }

  async function toggleSlider(slider: Slider) {
    try {
      await toggleMutation.mutateAsync(slider)
    } catch {
      toast.error(t("admin.feedback.statusError"), t("admin.feedback.requestFailed"))
    }
  }

  const error = slidersQuery.error ? t("admin.feedback.slider.loadError") : ""

  return {
    items,
    loading: slidersQuery.isPending,
    error,
    search,
    statusFilter,
    page: currentPage,
    totalPages,
    totalItems,
    nextDisplayOrder,
    setSearch: (value: string) => updateFilter(setSearchValue, value),
    setStatusFilter: (value: string) => updateFilter(setStatusFilterValue, value),
    setPage,
    reload: slidersQuery.refetch,
    saveSlider,
    deleteSlider,
    toggleSlider,
  }
}
