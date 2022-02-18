import {
  Card,
  getDefaultZIndex,
  Group,
  InputWrapper,
  Modal,
  ModalProps,
  Portal,
  SegmentedControl,
  Switch,
  Text,
} from '@mantine/core';
import { useInputState, useListState } from '@mantine/hooks';
import Cookies from 'js-cookie';
import { useEffect, useMemo } from 'react';
import { FiMenu } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { sortBy } from 'lodash';
import { scopes } from '~/utils/search';

const initialScopesCookie = (Cookies.get('scopes') ?? '').split(',');
const initialScopeState = sortBy(
  scopes
    .slice(1)
    .map((s) => ({ ...s, active: initialScopesCookie.includes(s.value) })),
  ({ value }) => {
    const idx = initialScopesCookie.indexOf(value);
    return idx > -1 ? idx : Infinity;
  },
);

export type Props = Pick<ModalProps, 'opened' | 'onClose'>;

export default function Settings(props: Props) {
  const cookieMode = useMemo(() => Cookies.get('mode') ?? 'newest', []);
  const [mode, setMode] = useInputState(cookieMode);
  const [scopeState, scopeStateHandlers] = useListState(initialScopeState);

  const ordered = mode === 'ordered';

  useEffect(() => {
    Cookies.set('mode', mode, { sameSite: 'strict' });
    Cookies.set(
      'scopes',
      scopeState
        .filter((scope) => ordered || scope.active)
        .map((scope) => scope.value),
    );
  }, [mode, ordered, scopeState]);

  return (
    <Modal {...props} title="git.pizza/<query> Settings">
      <Group direction="column">
        <Text size="sm">Settings for git.pizza short urls.</Text>
        <InputWrapper
          label="Mode"
          description="Newest will go to the newest package from all results, and you can disable individual sources. Ordered will prefer earlier sources before later sources."
        >
          <SegmentedControl
            value={mode}
            onChange={setMode}
            data={[
              { label: 'Newest', value: 'newest' },
              { label: 'Ordered', value: 'ordered' },
            ]}
          />
        </InputWrapper>
        <InputWrapper label="Sources" sx={{ width: '100%' }}>
          <DragDropContext
            onDragEnd={(result) =>
              scopeStateHandlers.reorder({
                from: result.source.index,
                to: result.destination?.index ?? 0,
              })
            }
          >
            <Droppable droppableId="sources">
              {(provided) => (
                <Group
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  direction="column"
                  spacing="xs"
                >
                  {scopeState.map((scope, index) => (
                    <Draggable
                      key={scope.value}
                      draggableId={scope.value}
                      index={index}
                      isDragDisabled={!ordered}
                    >
                      {(draggableProvided, draggableSnapshot) => {
                        const card = (
                          <Card
                            {...draggableProvided.draggableProps}
                            ref={draggableProvided.innerRef}
                            shadow="xs"
                            sx={{ width: '100%' }}
                          >
                            <Group noWrap>
                              <div
                                {...draggableProvided.dragHandleProps}
                                ref={draggableProvided.innerRef}
                              >
                                {ordered ? (
                                  <FiMenu />
                                ) : (
                                  <Switch
                                    checked={scope.active}
                                    onChange={(e) =>
                                      scopeStateHandlers.setItemProp(
                                        index,
                                        'active',
                                        Boolean(e.currentTarget.checked),
                                      )
                                    }
                                  />
                                )}
                              </div>
                              <Text>{scope.value}</Text>
                            </Group>
                          </Card>
                        );

                        return draggableSnapshot.isDragging ? (
                          <Portal zIndex={getDefaultZIndex('overlay')}>
                            {card}
                          </Portal>
                        ) : (
                          card
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Group>
              )}
            </Droppable>
          </DragDropContext>
        </InputWrapper>
      </Group>
    </Modal>
  );
}
