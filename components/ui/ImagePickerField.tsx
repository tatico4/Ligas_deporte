import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadImage, type StorageBucket } from "@/lib/storage";
import { shadow } from "@/lib/design";

type Shape = "circle" | "rounded";

interface Props {
  label: string;
  bucket: StorageBucket;
  storagePath: string;
  currentUrl?: string | null;
  placeholder?: string; // inicial o emoji para el placeholder
  placeholderColor?: string;
  shape?: Shape;
  size?: number;
  onUploaded: (url: string) => void;
}

export function ImagePickerField({
  label,
  bucket,
  storagePath,
  currentUrl,
  placeholder = "?",
  placeholderColor = "#16a34a",
  shape = "rounded",
  size = 88,
  onUploaded,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  const borderRadius = shape === "circle" ? size / 2 : 16;

  async function pick() {
    // Pedir permiso
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para subir imágenes."
      );
      return;
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: shape === "circle" ? [1, 1] : [1, 1],
      quality: 0.75,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPreview(uri); // preview inmediato
    setUploading(true);

    try {
      const publicUrl = await uploadImage(bucket, storagePath, uri);
      onUploaded(publicUrl);
    } catch (err: any) {
      Alert.alert("Error al subir imagen", err.message);
      setPreview(currentUrl ?? null); // revertir preview
    } finally {
      setUploading(false);
    }
  }

  function remove() {
    Alert.alert("Quitar imagen", "¿Deseas quitar la imagen actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: () => {
          setPreview(null);
          onUploaded("");
        },
      },
    ]);
  }

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <TouchableOpacity
        onPress={pick}
        activeOpacity={0.8}
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            overflow: "hidden",
            backgroundColor: preview ? "transparent" : placeholderColor + "22",
            borderWidth: 2.5,
            borderColor: preview ? "#16a34a" : "#e4e4e7",
            borderStyle: "dashed",
            alignItems: "center",
            justifyContent: "center",
          },
          preview ? shadow.sm : {},
        ]}
      >
        {uploading ? (
          <ActivityIndicator color="#16a34a" />
        ) : preview ? (
          <Image
            source={{ uri: preview }}
            style={{ width: size, height: size, borderRadius }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Ionicons name="camera-outline" size={24} color={placeholderColor} />
            <Text style={{ fontSize: 10, color: placeholderColor, fontWeight: "600" }}>
              Subir
            </Text>
          </View>
        )}

        {/* Badge de edición sobre la imagen */}
        {preview && !uploading && (
          <View
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              backgroundColor: "#16a34a",
              borderRadius: 10,
              width: 22,
              height: 22,
              alignItems: "center",
              justifyContent: "center",
              ...shadow.sm,
            }}
          >
            <Ionicons name="pencil" size={11} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View style={{ alignItems: "center", gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#52525b" }}>{label}</Text>
        {preview ? (
          <TouchableOpacity onPress={remove}>
            <Text style={{ fontSize: 11, color: "#dc2626" }}>Quitar imagen</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ fontSize: 11, color: "#a1a1aa" }}>Toca para elegir</Text>
        )}
      </View>
    </View>
  );
}
