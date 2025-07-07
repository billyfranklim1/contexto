# Como adicionar ícones à extensão (opcional)

A extensão está funcionando sem ícones, mas você pode adicionar depois se quiser.

## Opção 1: Usar o gerador incluído

1. Abra o arquivo `generate-icons.html` no Chrome
2. Clique com botão direito em cada ícone → "Salvar imagem como..."
3. Salve com os nomes exatos:
   - `icon-16.png`
   - `icon-48.png` 
   - `icon-128.png`

## Opção 2: Criar seus próprios ícones

Crie 3 arquivos PNG com as dimensões:
- `icon-16.png` (16x16 pixels)
- `icon-48.png` (48x48 pixels)
- `icon-128.png` (128x128 pixels)

## Opção 3: Baixar ícones prontos

Você pode usar qualquer ícone de cérebro/IA dos sites:
- [Flaticon](https://www.flaticon.com/search?word=brain)
- [Icons8](https://icons8.com/icons/set/brain)
- [Iconfinder](https://www.iconfinder.com/search?q=brain)

## Para ativar os ícones depois:

1. Coloque os 3 arquivos PNG na pasta da extensão
2. Edite o `manifest.json` e adicione após `"action": {`:

```json
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icon-16.png",
      "48": "icon-48.png",
      "128": "icon-128.png"
    }
  },
  "icons": {
    "16": "icon-16.png",
    "48": "icon-48.png",
    "128": "icon-128.png"
  }
```

3. Recarregue a extensão no Chrome 