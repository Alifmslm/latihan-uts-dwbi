import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

const ITEM_PREFIX = "item:";
const TARGET_PREFIX = "target:";
const POOL_ID = "pool";

function stripId(id, prefix) {
  return typeof id === "string" && id.startsWith(prefix)
    ? id.slice(prefix.length)
    : null;
}

function Chip({ item, disabled, state, overlay = false, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${ITEM_PREFIX}${item}`,
      disabled,
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const className = [
    "chip",
    isDragging ? "chip-dragging" : "",
    overlay ? "chip-overlay" : "",
    state === "correct" ? "chip-correct" : "",
    state === "wrong" ? "chip-wrong" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      {...listeners}
      {...attributes}
    >
      <span className="chip-grip" aria-hidden="true">⠿</span>
      <span className="chip-label">{item}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          className="chip-remove"
          aria-label={`Kembalikan ${item} ke daftar item`}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </div>
  );
}

function Pool({ items, disabled, checked }) {
  const { setNodeRef, isOver } = useDroppable({
    id: POOL_ID,
    disabled,
  });

  return (
    <div ref={setNodeRef} className={`pool${isOver ? " pool-over" : ""}`}>
      <p className="pool-label">
        Item tersedia{checked && items.length > 0 ? " · belum ditempatkan" : ""}
      </p>
      <div className="pool-items">
        {items.length === 0 ? (
          <span className="pool-empty">Semua item sudah ditempatkan.</span>
        ) : (
          items.map((item) => (
            <Chip
              key={item}
              item={item}
              disabled={disabled}
              state={checked ? "wrong" : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Target({
  index,
  text,
  placedItem,
  status,
  correctItem,
  disabled,
  onRemove,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${TARGET_PREFIX}${index}`,
    disabled,
  });

  const className = [
    "target",
    isOver ? "target-over" : "",
    status === "correct" ? "target-correct" : "",
    status === "wrong" ? "target-wrong" : "",
    status === "miss" ? "target-miss" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} className={className}>
      <p className="target-text">{text}</p>
      <div className="target-slot">
        {placedItem ? (
          <Chip
            item={placedItem}
            disabled={disabled}
            state={
              status === "correct"
                ? "correct"
                : status === "wrong"
                  ? "wrong"
                  : undefined
            }
            onRemove={onRemove}
          />
        ) : (
          <span className="target-placeholder">Letakkan item di sini</span>
        )}
      </div>
      {disabled && status !== "correct" && (
        <p className="target-answer">
          {status === "miss" ? "Belum diisi. " : ""}
          Jawaban benar: <strong>{correctItem}</strong>
        </p>
      )}
    </div>
  );
}

export default function DragDrop({ question, onAnswered, review }) {
  const { items, targets, jawaban } = question;
  const [placements, setPlacements] = useState(() => review?.placements ?? {});
  const [checked, setChecked] = useState(Boolean(review));
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  const poolItems = items.filter((item) => placements[item] === undefined);

  function handleDragStart({ active }) {
    setActiveItem(stripId(active.id, ITEM_PREFIX));
  }

  function handleDragEnd({ active, over }) {
    setActiveItem(null);
    if (checked || !over) return;

    const item = stripId(active.id, ITEM_PREFIX);
    if (!item) return;

    if (over.id === POOL_ID) {
      setPlacements((prev) => {
        if (!(item in prev)) return prev;
        const next = { ...prev };
        delete next[item];
        return next;
      });
      return;
    }

    const rawTarget = stripId(over.id, TARGET_PREFIX);
    if (rawTarget === null) return;

    const targetIndex = Number(rawTarget);
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= targets.length
    ) {
      return;
    }

    setPlacements((prev) => {
      const next = { ...prev };
      const previousTarget = prev[item];
      const occupant = Object.keys(next).find(
        (key) => next[key] === targetIndex && key !== item
      );

      if (occupant) {
        if (previousTarget === undefined) delete next[occupant];
        else next[occupant] = previousTarget;
      }

      next[item] = targetIndex;
      return next;
    });
  }

  function handleDragCancel() {
    setActiveItem(null);
  }

  function removeItem(item) {
    setPlacements((prev) => {
      if (!(item in prev)) return prev;
      const next = { ...prev };
      delete next[item];
      return next;
    });
  }

  function handleCheck() {
    const allCorrect = items.every((item) => {
      const targetIndex = placements[item];
      return (
        targetIndex !== undefined && targets[targetIndex] === jawaban[item]
      );
    });

    setChecked(true);
    onAnswered(allCorrect, "", { placements });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="dd">
        <p className="dd-hint">
          Seret item ke kotak yang sesuai. Di HP, tahan sebentar lalu geser.
        </p>

        <Pool items={poolItems} disabled={checked} checked={checked} />

        <div className="targets">
          {targets.map((text, targetIndex) => {
            const placedItem = items.find(
              (item) => placements[item] === targetIndex
            );

            let status = "";
            if (checked) {
              if (!placedItem) status = "miss";
              else if (targets[targetIndex] === jawaban[placedItem]) {
                status = "correct";
              } else {
                status = "wrong";
              }
            }

            const correctItem =
              items.find((item) => jawaban[item] === text) ?? "—";

            return (
              <Target
                key={text}
                index={targetIndex}
                text={text}
                placedItem={placedItem}
                status={status}
                correctItem={correctItem}
                disabled={checked}
                onRemove={placedItem ? () => removeItem(placedItem) : undefined}
              />
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-secondary check-btn"
          onClick={handleCheck}
          disabled={checked}
        >
          {checked ? "Sudah diperiksa" : "Periksa Jawaban"}
        </button>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="chip chip-overlay">
            <span className="chip-grip" aria-hidden="true">⠿</span>
            <span className="chip-label">{activeItem}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
