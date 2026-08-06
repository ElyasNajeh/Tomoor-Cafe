import { EmptyState, LoadableContent } from "@/shared/components/AdminComponents"
import type { Slider } from "../sliders.types"
import { SliderTableRow } from "./SliderTableRow"

type SliderTableProps = {
  items: Slider[]
  loading: boolean
  error: string
  onCreate: () => void
  onEdit: (slider: Slider) => void
  onToggle: (slider: Slider) => void
  onDelete: (slider: Slider) => void
  onRetry: () => void
}

export function SliderTable(props: SliderTableProps) {
  return (
    <LoadableContent loading={props.loading} loadingMessage="Loading sliders…" error={props.error} onRetry={props.onRetry}>
      {props.items.length === 0 ? (
        <EmptyState
          title="No sliders yet"
          message="Add a promotional slide for the company home page."
          action={<button className="button" onClick={props.onCreate}>Add slider</button>}
        />
      ) : (
        <div className="table-card">
          <div className="product-table product-table--head slider-table">
            <span>Slider</span><span>Order</span><span>Created</span><span>Status</span><span>Actions</span>
          </div>
          {props.items.map((slider) => (
            <SliderTableRow
              key={slider.id}
              slider={slider}
              onEdit={props.onEdit}
              onToggle={props.onToggle}
              onDelete={props.onDelete}
            />
          ))}
        </div>
      )}
    </LoadableContent>
  )
}
