fx_version 'cerulean'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
game 'rdr3'

author 'Betiucia'
description 'Um sistema de menu NUI base e Progress Bar para RedM.'
version '1.0.0'

-- Define que este script é um provedor de funcionalidade, útil para dependências.
provides {
    'btc-menu'
}

-- Scripts do lado do cliente e do servidor
client_script 'client/main.lua'
server_script 'server/main.lua'

-- Define o arquivo da NUI e os arquivos que precisam ser enviados ao cliente
ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/images/*.png',
    'html/images/layout/*.png',
    'html/images/layout/*.svg',
    'html/fonts/*.ttf'
}

exports {
    'openMenu',
    'closeMenu',
    'showProgressBar'
}
