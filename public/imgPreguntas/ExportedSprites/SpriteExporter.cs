
using UnityEngine;
using UnityEditor;
using System.IO;

public class SpriteExporter : MonoBehaviour
{
    [MenuItem("Tools/Export Sprites To PNG")]
    static void ExportSpritesToPNG()
    {
        Object obj = Selection.activeObject;
        string path = AssetDatabase.GetAssetPath(obj);

        // Cargar todos los sub-assets (sprites) del archivo
        Object[] assets = AssetDatabase.LoadAllAssetRepresentationsAtPath(path);

        foreach (Object asset in assets)
        {
            if (asset is Sprite sprite)
            {
                Texture2D tex = new Texture2D((int)sprite.rect.width, (int)sprite.rect.height);
                var pixels = sprite.texture.GetPixels(
                    (int)sprite.rect.x,
                    (int)sprite.rect.y,
                    (int)sprite.rect.width,
                    (int)sprite.rect.height);
                tex.SetPixels(pixels);
                tex.Apply();

                // Convertir a PNG
                byte[] pngData = tex.EncodeToPNG();

                // Crear carpeta de salida
                string outputFolder = "Assets/ExportedSprites";
                if (!Directory.Exists(outputFolder))
                    Directory.CreateDirectory(outputFolder);

                string fileName = Path.Combine(outputFolder, sprite.name + ".png");
                File.WriteAllBytes(fileName, pngData);
            }
        }

        AssetDatabase.Refresh();
        Debug.Log("Sprites exportados a Assets/ExportedSprites");
    }
}
