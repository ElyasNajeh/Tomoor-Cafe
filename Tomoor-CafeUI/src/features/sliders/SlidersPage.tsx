import { useState } from "react"
import { PageHeader, Pagination } from "@/shared/components/AdminComponents"
import { SliderFilters } from "./components/SliderFilters"
import { SliderFormDialog } from "./components/SliderFormDialog"
import { SliderTable } from "./components/SliderTable"
import { useSliders } from "./hooks/useSliders"
import type { Slider } from "./sliders.types"

type EditingSlider = Slider | null | undefined

export function SlidersPage() {
  const sliders = useSliders()
  const [editingSlider, setEditingSlider] = useState<EditingSlider>(() =>
    new URLSearchParams(window.location.search).has("new") ? null : undefined,
  )

  return (
    <section>
      <PageHeader
        eyebrow="Home page"
        icon="sliders"
        title="Sliders"
        description="Manage promotional slides, display order, visibility, and imagery."
        actions={<button className="button" onClick={() => setEditingSlider(null)}>+ Add slider</button>}
      />

      <SliderFilters
        search={sliders.search}
        status={sliders.statusFilter}
        onSearchChange={sliders.setSearch}
        onStatusChange={sliders.setStatusFilter}
      />

      <SliderTable
        items={sliders.items}
        loading={sliders.loading}
        error={sliders.error}
        onCreate={() => setEditingSlider(null)}
        onEdit={setEditingSlider}
        onToggle={(slider) => void sliders.toggleSlider(slider)}
        onDelete={(slider) => void sliders.deleteSlider(slider)}
        onRetry={() => void sliders.reload()}
      />

      {editingSlider !== undefined && (
        <SliderFormDialog
          key={editingSlider?.id ?? "new"}
          slider={editingSlider}
          onClose={() => setEditingSlider(undefined)}
          onSave={sliders.saveSlider}
        />
      )}

      {!sliders.loading && !sliders.error && (
        <Pagination
          page={sliders.page}
          totalPages={sliders.totalPages}
          totalItems={sliders.totalItems}
          onChange={sliders.setPage}
        />
      )}
    </section>
  )
}
