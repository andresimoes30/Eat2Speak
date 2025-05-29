"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Filter } from "lucide-react"

// Mock data for transactions
const transactions = [
  {
    id: "T12345",
    date: "15 Maio, 2025",
    description: "Sessão de Italiano com Maria Silva",
    restaurant: "La Pasta Italiana",
    amount: 120.0,
    status: "completed",
  },
  {
    id: "T12346",
    date: "10 Maio, 2025",
    description: "Sessão de Japonês com Hiroshi Tanaka",
    restaurant: "Sushi Koi",
    amount: 150.0,
    status: "completed",
  },
  {
    id: "T12347",
    date: "05 Maio, 2025",
    description: "Sessão de Francês com Pierre Dubois",
    restaurant: "Le Bistrot",
    amount: 135.0,
    status: "completed",
  },
  {
    id: "T12348",
    date: "18 Maio, 2025",
    description: "Sessão de Japonês com Hiroshi Tanaka",
    restaurant: "Sushi Koi",
    amount: 150.0,
    status: "pending",
  },
]

// Mock data for payment methods
const paymentMethods = [
  {
    id: 1,
    type: "credit",
    last4: "4242",
    expiry: "05/26",
    brand: "Visa",
    isDefault: true,
  },
  {
    id: 2,
    type: "credit",
    last4: "1234",
    expiry: "08/27",
    brand: "Mastercard",
    isDefault: false,
  },
]

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("history")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pagamentos</h2>
        <p className="text-muted-foreground">
          Gerencie seus métodos de pagamento e visualize seu histórico de transações
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Histórico de Transações</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              <CardDescription>Visualize todas as suas transações recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Restaurante</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.restaurant}</TableCell>
                      <TableCell className="text-right">R$ {transaction.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status === "completed" ? "Concluído" : "Pendente"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Custos</CardTitle>
              <CardDescription>Entenda como o valor de cada sessão é distribuído</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Exemplo de uma sessão de R$ 150,00</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Preço do menu</span>
                      <span>R$ 100,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comissão do restaurante (10%)</span>
                      <span>R$ 10,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa da plataforma</span>
                      <span>R$ 15,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagamento ao professor</span>
                      <span>R$ 25,00</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>R$ 150,00</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Nota: Os valores acima são apenas ilustrativos. O preço real pode variar de acordo com o restaurante,
                  o professor e o tipo de sessão escolhida.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Gerencie seus cartões e outras formas de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-10 w-10 mr-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {method.brand} •••• {method.last4}
                        {method.isDefault && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Padrão</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">Expira em {method.expiry}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    {!method.isDefault && (
                      <Button variant="outline" size="sm">
                        Definir como padrão
                      </Button>
                    )}
                    {!method.isDefault && (
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button className="w-full bg-wine-600 hover:bg-wine-700">Adicionar Novo Método de Pagamento</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
