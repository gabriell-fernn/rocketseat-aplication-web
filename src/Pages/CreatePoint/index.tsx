import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import api from "../../services/api";

import "./styles.css";

import logo from "../../assets/logo.svg";

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IGBEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

export default function Index() {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        whatsapp: "",
    });

    const [selectedUf, setSelectedUf] = useState("0");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedCity, setSelectedCity] = useState("0");

    const navigate = useNavigate();

    useEffect(() => {
        api.get("items").then((response) => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        axios
            .get<IGBEUFResponse[]>(
                "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
            )
            .then((response) => {
                const ufInitials = response.data.map((uf) => uf.sigla);
                setUfs(ufInitials);
            });
    });

    useEffect(() => {
        if (selectedUf === "0") {
            return;
        }

        axios
            .get<IBGECityResponse[]>(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
            )
            .then((response) => {
                const cityNames = response.data.map((city) => city.nome);
                setCities(cityNames);
            });
    }, [selectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({ ...formData, [name]: value });
    }

    function handleSelectItem(id: number) {
        const alreadySelected = selectedItems.findIndex((item) => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter((item) => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            items,
        };

        await api.post("points", data);

        alert("Ponto de coleta criado!");

        navigate("/");
    }

    return (
        <>
            <div id="page-create-point">
                <header>
                    <img src={logo} alt="Ecoleta" />

                    <Link to="/">
                        <FiArrowLeft />
                        <p>Voltar para Home</p>
                    </Link>
                </header>

                <form onSubmit={handleSubmit}>
                    <h1>
                        Cadastro do <br /> ponto de coleta
                    </h1>

                    <fieldset>
                        <legend>
                            <h2>Dados</h2>
                        </legend>

                        <div className="field">
                            <label htmlFor="name">Nome da entidade</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="whatsapp">Whatsapp</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    id="whatsapp"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço no mapa</span>
                        </legend>

                        <MapContainer
                            center={[-16.7262149, -49.2740054]}
                            zoom={15}
                        >
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <Marker position={[-16.7262149, -49.2740054]} />
                        </MapContainer>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="uf">Estado (UF)</label>
                                <select
                                    name="uf"
                                    id="uf"
                                    value={selectedUf}
                                    onChange={handleSelectUf}
                                >
                                    <option value="0">Selecione um UF</option>
                                    {ufs.map((uf) => (
                                        <option key={uf} value={uf}>
                                            {uf}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="city">Cidade</label>
                                <select
                                    name="city"
                                    id="city"
                                    value={selectedCity}
                                    onChange={handleSelectCity}
                                >
                                    <option value="0">
                                        Selecione uma cidade
                                    </option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>
                            <h2>Ítens de coleta</h2>
                            <span>Selecione um ou mais ítens abaixo</span>
                        </legend>

                        <ul className="items-grid">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => handleSelectItem(item.id)}
                                    className={
                                        selectedItems.includes(item.id)
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                    />
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </fieldset>

                    <button type="submit">Cadastrar ponto de coleta</button>
                </form>
            </div>
        </>
    );
}
