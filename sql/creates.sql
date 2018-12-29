

CREATE TABLE tbEstados(
	stNome VARCHAR(20) NOT NULL,
    PRIMARY KEY (stNome)
) ENGINE=innodb;

CREATE TABLE tbUsuarios(
	stEmail VARCHAR(50) NOT NULL,
    stSenha VARCHAR(20) NOT NULL,
    stUsername VARCHAR(40) NOT NULL,
    stEstado VARCHAR(20) NOT NULL,
    stCidade VARCHAR(40) NOT NULL,
    PRIMARY KEY (stEmail),
    FOREIGN KEY (stEstado) REFERENCES tbEstados(stNome)
) ENGINE=innodb;

CREATE TABLE tbCategorias(
	stCategoria VARCHAR(40) NOT NULL,
    PRIMARY KEY (stCategoria)
) ENGINE=innodb;

CREATE TABLE tbAnuncios(
	itId INT(11) AUTO_INCREMENT,
    stDono VARCHAR(50) NOT NULL,
    stNomeItem VARCHAR(60) NOT NULL,
    stDescricao VARCHAR(255),
    stCategoria VARCHAR(40),
    stFoto VARCHAR(128),
    dtData DATETIME DEFAULT NOW(),
    stCidade VARCHAR(40) NOT NULL,
    stEstado VARCHAR(20) NOT NULL,
    dcPreco DECIMAL(13,2) NOT NULL,
    itEstoque INT(5) DEFAULT 1,
    PRIMARY KEY (itId),
    FOREIGN KEY (stEstado) REFERENCES tbEstados(stNome),
    FOREIGN KEY (stDono) REFERENCES tbUsuarios(stEmail),
    FOREIGN KEY (stCategoria) REFERENCES tbCategorias(stCategoria)
) ENGINE=innodb;

CREATE TABLE tbChat(
	itId INTEGER(9) NOT NULL UNIQUE,
	stUsuario VARCHAR(50) NOT NULL,
	itAnuncio INT(11) NOT NULL,
    PRIMARY KEY (stUsuario, itAnuncio),
    FOREIGN KEY (stUsuario) REFERENCES tbUsuarios(stEmail),
    FOREIGN KEY (itAnuncio) REFERENCES tbAnuncios(itId)
) ENGINE=innodb;