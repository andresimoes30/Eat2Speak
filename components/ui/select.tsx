import * as React from "react"
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ScrollView
} from "react-native"

// Definiciones de estilos
const styles = StyleSheet.create({
  // Estilos para Select
  select: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 4,
    padding: 8,
    backgroundColor: 'white',
  },
  
  // Estilos para SelectTrigger
  trigger: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerDefault: {
    height: 36, // h-9
  },
  triggerSm: {
    height: 32, // h-8
  },
  
  // Estilos para SelectContent
  content: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    borderRadius: 4,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 4,
    maxHeight: 200,
  },
  
  // Estilos para SelectItem
  item: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  itemText: {
    fontSize: 14,
  },
  itemSelected: {
    backgroundColor: '#f3f4f6', // gray-100
  },
  
  // Estilos adicionales
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb', // gray-200
    marginVertical: 4,
  },
  arrowIcon: {
    fontSize: 10,
    color: '#6b7280', // gray-500
    marginLeft: 8,
  },
})

// Interfaz para Select
interface SelectProps {
  onValueChange?: (value: string) => void
  defaultValue?: string
  value?: string
  style?: StyleProp<ViewStyle>
  className?: string // Para compatibilidad
  children?: React.ReactNode
}

// Context para compartir estado entre componentes
interface SelectContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  value: string
  onValueChange?: (value: string) => void
  items: { value: string, label: React.ReactNode }[]
  addItem: (item: { value: string, label: React.ReactNode }) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

// Hook para usar el contexto
const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select component")
  }
  return context
}

// Componente principal Select
function Select({ 
  children, 
  onValueChange, 
  defaultValue = "", 
  value: controlledValue, 
  style, 
  className, 
  ...props 
}: SelectProps) {
  // Estado
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<{ value: string, label: React.ReactNode }[]>([])
  const [value, setValue] = React.useState(defaultValue || "")
  
  // Actualizar valor cuando cambia value prop
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue)
    }
  }, [controlledValue])
  
  // Función para agregar items
  const addItem = React.useCallback((item: { value: string, label: React.ReactNode }) => {
    setItems(prev => [...prev, item])
  }, [])
  
  // Manejador de cambio de valor
  const handleValueChange = React.useCallback((newValue: string) => {
    if (controlledValue === undefined) {
      setValue(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [controlledValue, onValueChange])
  
  // Valor de contexto
  const contextValue = React.useMemo(() => ({
    open,
    setOpen,
    value,
    onValueChange: handleValueChange,
    items,
    addItem
  }), [open, setOpen, value, handleValueChange, items, addItem])
  
  return (
    <SelectContext.Provider value={contextValue}>
      <View style={style} {...props}>
        {children}
      </View>
    </SelectContext.Provider>
  )
}

// Interfaz para SelectTrigger
interface SelectTriggerProps {
  style?: StyleProp<ViewStyle>
  size?: "sm" | "default"
  className?: string // Para compatibilidad
  children?: React.ReactNode
}

function SelectTrigger({ style, size = "default", children, className, ...props }: SelectTriggerProps) {
  const { setOpen } = useSelectContext()
  
  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        size === "sm" ? styles.triggerSm : styles.triggerDefault,
        style
      ]}
      onPress={() => setOpen(true)}
      activeOpacity={0.7}
      {...props}
    >
      <View style={{ flex: 1 }}>
        {children}
      </View>
      <Text style={styles.arrowIcon}>▼</Text>
    </TouchableOpacity>
  )
}

// Interfaz para SelectValue
interface SelectValueProps {
  style?: StyleProp<TextStyle>
  placeholder?: string
  className?: string // Para compatibilidad
  children?: React.ReactNode
}

function SelectValue({ style, children, placeholder, className, ...props }: SelectValueProps) {
  const { value, items } = useSelectContext()
  
  // Encontrar el label correspondiente al valor actual
  const selectedItem = items.find(item => item.value === value)
  const displayText = selectedItem?.label || children || placeholder || value
  
  return (
    <Text style={style} {...props}>
      {displayText}
    </Text>
  )
}

// Interfaz para SelectContent
interface SelectContentProps {
  style?: StyleProp<ViewStyle>
  position?: "popper" | "item-aligned" // Mantener por compatibilidad
  className?: string // Para compatibilidad
  children?: React.ReactNode
}

function SelectContent({ style, position, children, className, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  
  if (!open) return null
  
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <ScrollView style={[styles.content, style]} {...props}>
            {children}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// Interfaz para SelectItem
interface SelectItemProps {
  value: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  className?: string // Para compatibilidad
  children?: React.ReactNode
}

function SelectItem({ value: itemValue, style, textStyle, children, className, ...props }: SelectItemProps) {
  const { value, onValueChange, setOpen } = useSelectContext()
  const isSelected = value === itemValue
  
  // Registrar este item en el contexto al montarse
  const { addItem } = useSelectContext()
  React.useEffect(() => {
    addItem({ value: itemValue, label: children })
  }, [addItem, itemValue, children])
  
  return (
    <TouchableOpacity
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        style
      ]}
      onPress={() => {
        onValueChange?.(itemValue)
        setOpen(false)
      }}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.itemText, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}

// Componentes adicionales simplificados para mantener la API compatible
const SelectGroup = (props: React.ComponentProps<typeof View>) => <View {...props} />
const SelectLabel = (props: React.ComponentProps<typeof Text>) => <Text style={{ fontWeight: '500', marginBottom: 4 }} {...props} />
const SelectSeparator = (props: React.ComponentProps<typeof View>) => <View style={[styles.separator, props.style]} {...props} />
const SelectScrollUpButton = (props: React.ComponentProps<typeof TouchableOpacity>) => <TouchableOpacity {...props} />
const SelectScrollDownButton = (props: React.ComponentProps<typeof TouchableOpacity>) => <TouchableOpacity {...props} />

// Agregar displayName para todos los componentes
Select.displayName = "Select"
SelectTrigger.displayName = "SelectTrigger"
SelectValue.displayName = "SelectValue"
SelectContent.displayName = "SelectContent"
SelectItem.displayName = "SelectItem"
SelectGroup.displayName = "SelectGroup"
SelectLabel.displayName = "SelectLabel"
SelectSeparator.displayName = "SelectSeparator"
SelectScrollUpButton.displayName = "SelectScrollUpButton"
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}