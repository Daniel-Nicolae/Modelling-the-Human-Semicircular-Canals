import { View } from "react-native"

interface SeparatorProps {space: number}
const Separator = ({space}: SeparatorProps) => <View style={{marginVertical: space}} />

export default Separator