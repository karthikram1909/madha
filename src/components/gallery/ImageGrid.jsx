import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Gallery } from '@/api/entities';

export default function ImageGrid({ images, setImages, onEdit, onDelete }) {
  
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedImages = Array.from(images);
    const [movedItem] = reorderedImages.splice(source.index, 1);
    reorderedImages.splice(destination.index, 0, movedItem);

    setImages(reorderedImages);

    // Update display_order in the backend
    try {
      const updatePromises = reorderedImages.map((img, index) =>
        Gallery.update(img.id, { display_order: index })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to update image order:", error);
      // Optionally revert state or show an error message
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="gallery" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <Draggable key={image.id} draggableId={image.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative group overflow-hidden rounded-lg shadow-lg aspect-square"
                    >
                      <img src={image.image_url} alt={image.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                        <div>
                          <h3 className="font-bold truncate">{image.title}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {image.tags?.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white" onClick={() => onEdit(image)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => onDelete(image.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}