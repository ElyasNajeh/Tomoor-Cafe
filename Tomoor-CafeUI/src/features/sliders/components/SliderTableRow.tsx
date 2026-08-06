import { getAssetUrl } from "@/shared/api/assets"
import { StatusBadge } from "@/shared/components/AdminComponents"
import { Icon } from "@/shared/components/Icon"
import type { Slider } from "../sliders.types"

type SliderTableRowProps = {
  slider: Slider
  onEdit: (slider: Slider) => void
  onToggle: (slider: Slider) => void
  onDelete: (slider: Slider) => void
}

export function SliderTableRow(props: SliderTableRowProps) {
  const { slider } = props

  return (
    <article className="product-table slider-table">
      <div className="product-cell slider-cell">
        <img src={getAssetUrl(slider.image)} alt="" />
        <span>
          <strong>{slider.title_en}</strong>
          <small dir="rtl">{slider.title_ar}</small>
        </span>
      </div>
      <span>{slider.display_order}</span>
      <span>{new Date(slider.created_at).toLocaleDateString()}</span>
      <StatusBadge active={slider.is_active} />
      <div className="row-actions">
        <button className="icon-button" title="Edit" onClick={() => props.onEdit(slider)}>
          <Icon name="edit" />
        </button>
        <button
          className="icon-button"
          title={slider.is_active ? "Hide" : "Activate"}
          onClick={() => props.onToggle(slider)}
        >
          <Icon name={slider.is_active ? "eyeOff" : "eye"} />
        </button>
        <button
          className="icon-button icon-button--danger"
          title="Delete"
          onClick={() => props.onDelete(slider)}
        >
          <Icon name="trash" />
        </button>
      </div>
    </article>
  )
}
